package com.gstech.saas.communication.service;

import com.gstech.saas.communication.dto.AssociationAddressDto;
import com.gstech.saas.communication.dto.OwnerDto;
import com.gstech.saas.communication.model.Message;
import com.gstech.saas.communication.repository.MailingRecipientRepository;
import com.gstech.saas.communication.repository.MessageRepository;
import com.lowagie.text.*;
import com.lowagie.text.pdf.ColumnText;
import com.lowagie.text.pdf.PdfWriter;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

@Service
@RequiredArgsConstructor
public class MailingPdfService {

    private final MessageRepository messageRepository;
    private final MailingRecipientRepository mailingRecipientRepository;
    private final OwnerLookupService ownerLookupService;
    private final MailingContentRenderer contentRenderer;

    /**
     * Generate PDF for a single recipient of a mailing.
     * Returns raw PDF bytes for streaming to the browser.
     */
    @Transactional
    public byte[] generateForOwner(Long mailingId, Long ownerId) {
        Message message = messageRepository.findById(mailingId)
                .orElseThrow(() -> new EntityNotFoundException("Mailing not found: " + mailingId));

        OwnerDto owner = ownerLookupService.findOwnersByAssociation(message.getAssociationId())
                .stream()
                .filter(o -> o.getOwnerId().equals(ownerId))
                .findFirst()
                .orElseThrow(() -> new EntityNotFoundException("Owner not found: " + ownerId));

        return buildPdf(message, owner);
    }

    /**
     * Generate a ZIP of all recipient PDFs for a mailing.
     */
    @Transactional
    public byte[] generateAllAsZip(Long mailingId) throws IOException {
        Message message = messageRepository.findById(mailingId).orElseThrow();
        List<OwnerDto> owners =
                ownerLookupService.findOwnersByAssociation(message.getAssociationId());

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        try (ZipOutputStream zip = new ZipOutputStream(baos)) {
            for (OwnerDto owner : owners) {
                byte[] pdf = buildPdf(message, owner);

                // ownerId suffix prevents duplicate entry when two owners share the same name
                String filename = owner.getName().replace(" ", "_")
                        + "_" + owner.getOwnerId() + ".pdf";

                zip.putNextEntry(new ZipEntry(filename));
                zip.write(pdf);
                zip.closeEntry();
            }
        }
        return baos.toByteArray();
    }

    // ── Window-envelope layout (#10 double-window envelope, letter folded in thirds) ──
    // All values in PDF points (72 pt = 1 inch), measured from the page edges.
    private static final float PAGE_HEIGHT        = PageSize.LETTER.getHeight();   // 792
    private static final float ADDRESS_LEFT       = 0.75f * 72f;   // left edge of both address blocks
    private static final float ADDRESS_WIDTH      = 3.6f * 72f;    // stays inside the envelope windows
    private static final float RETURN_TOP         = 0.80f * 72f;   // top window: sender / return address
    private static final float RECIPIENT_TOP      = 2.40f * 72f;   // bottom window: recipient address
    private static final float ADDRESS_BLOCK_H    = 1.00f * 72f;
    private static final float BODY_START         = 3.90f * 72f;   // below the first fold (3 2/3")
    private static final float PAGE_MARGIN        = 54f;           // normal margin (0.75")

    /** "City, ST 06074" - the way a postal address is written. */
    private static String cityStateZip(String city, String state, String zip) {
        String cs = Stream.of(city, state)
                .filter(s -> s != null && !s.isBlank())
                .map(String::trim)
                .collect(Collectors.joining(", "));
        String z = (zip == null || zip.isBlank()) ? "" : zip.trim();
        return (cs + (cs.isEmpty() || z.isEmpty() ? "" : " ") + z).trim();
    }

    /** Draws a text block with its top-left corner at (left, topFromPageTop) on the page. */
    private static void drawBlock(PdfWriter writer, List<Paragraph> lines, float left, float topFromPageTop)
            throws DocumentException {
        float top = PAGE_HEIGHT - topFromPageTop;
        ColumnText ct = new ColumnText(writer.getDirectContent());
        ct.setSimpleColumn(left, top - ADDRESS_BLOCK_H, left + ADDRESS_WIDTH, top);
        for (Paragraph p : lines) {
            ct.addElement(p);
        }
        ct.go();
    }

    private static Paragraph line(String text, Font font) {
        Paragraph p = new Paragraph(text, font);
        p.setLeading(14f);
        p.setSpacingBefore(0f);
        p.setSpacingAfter(0f);
        return p;
    }

    private byte[] buildPdf(Message message, OwnerDto owner) {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        Document doc = new Document(PageSize.LETTER, PAGE_MARGIN, PAGE_MARGIN, PAGE_MARGIN, PAGE_MARGIN);

        try {
            PdfWriter writer = PdfWriter.getInstance(doc, out);
            doc.open();

            Font nameFont = FontFactory.getFont(FontFactory.TIMES_BOLD, 12);
            Font addrFont = FontFactory.getFont(FontFactory.TIMES_ROMAN, 12);
            Font bodyFont = FontFactory.getFont(FontFactory.HELVETICA, 11);

            // ── Return address -> TOP envelope window ───────────────────
            String assocName = ownerLookupService.getAssociationName(message.getAssociationId());
            AssociationAddressDto assocAddress =
                    ownerLookupService.getAssociationAddressDetails(message.getAssociationId());

            List<Paragraph> fromLines = new ArrayList<>();
            fromLines.add(line(assocName, nameFont));
            if (assocAddress.getStreet() != null && !assocAddress.getStreet().isBlank()) {
                fromLines.add(line(assocAddress.getStreet(), addrFont));
            }
            String fromCity = cityStateZip(assocAddress.getCity(), assocAddress.getState(), assocAddress.getZipCode());
            if (!fromCity.isBlank()) {
                fromLines.add(line(fromCity, addrFont));
            }
            drawBlock(writer, fromLines, ADDRESS_LEFT, RETURN_TOP);

            // ── Recipient address -> BOTTOM envelope window ─────────────
            List<Paragraph> toLines = new ArrayList<>();
            toLines.add(line(owner.getName(), addrFont));
            if (owner.getStreet() != null && !owner.getStreet().isBlank()) {
                toLines.add(line(owner.getStreet(), addrFont));
            }
            String toCity = cityStateZip(owner.getCity(), owner.getState(), owner.getZipCode());
            if (!toCity.isBlank()) {
                toLines.add(line(toCity, addrFont));
            }
            drawBlock(writer, toLines, ADDRESS_LEFT, RECIPIENT_TOP);

            // ── Body: starts below the first fold so it never shows in a window ──
            // An empty line with a fixed leading pushes the text down to BODY_START.
            Paragraph spacer = new Paragraph(" ", bodyFont);
            spacer.setLeading(BODY_START - PAGE_MARGIN);
            doc.add(spacer);

            String body = contentRenderer.render(message.getBody(), message, owner);
            doc.add(new Paragraph(body, bodyFont));
            doc.close();

        } catch (DocumentException e) {
            throw new RuntimeException("PDF generation failed for owner " + owner.getOwnerId(), e);
        }

        return out.toByteArray();
    }
}
