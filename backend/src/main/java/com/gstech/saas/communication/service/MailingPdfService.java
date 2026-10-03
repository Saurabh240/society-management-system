package com.gstech.saas.communication.service;

import com.gstech.saas.communication.dto.AssociationAddressDto;
import com.gstech.saas.communication.dto.OwnerDto;
import com.gstech.saas.communication.model.Message;
import com.gstech.saas.communication.repository.MailingRecipientRepository;
import com.gstech.saas.communication.repository.MessageRepository;
import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfWriter;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
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

    /**
     * Generate PDF for a single recipient of a mailing.
     * Returns raw PDF bytes for streaming to the browser.
     */
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

    private byte[] buildPdf(Message message, OwnerDto owner) {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        Document doc = new Document(PageSize.LETTER);

        try {
            PdfWriter.getInstance(doc, out);
            doc.open();

            Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12);
            Font bodyFont   = FontFactory.getFont(FontFactory.HELVETICA, 11);
            Font addrFont   = FontFactory.getFont(FontFactory.HELVETICA, 10);

            // ── FROM address block (top-left) ──────────────────────────
            // No "From:" label, and laid out line-by-line the same way the
            // recipient ("To") block below is laid out: bold name line, then
            // street, then "City, State ZIP".
            String assocName = ownerLookupService.getAssociationName(message.getAssociationId());
            AssociationAddressDto assocAddress =
                    ownerLookupService.getAssociationAddressDetails(message.getAssociationId());

            doc.add(new Paragraph(assocName, headerFont));
            if (assocAddress.getStreet() != null && !assocAddress.getStreet().isBlank()) {
                doc.add(new Paragraph(assocAddress.getStreet(), addrFont));
            }
            String fromCityLine = Stream.of(assocAddress.getCity(), assocAddress.getState(), assocAddress.getZipCode())
                    .filter(s -> s != null && !s.isBlank())
                    .collect(Collectors.joining(", "));
            if (!fromCityLine.isBlank()) {
                doc.add(new Paragraph(fromCityLine, addrFont));
            }
            doc.add(Chunk.NEWLINE);

            // ── TO / mailing address block ─────────────────────────────
            // No "To:" label and no unit-number line — just name, street,
            // and "City, State ZIP", matching the From block above.
            doc.add(new Paragraph(owner.getName(), headerFont));

            if (owner.getStreet() != null && !owner.getStreet().isBlank()) {
                doc.add(new Paragraph(owner.getStreet(), addrFont));
            }
            String cityLine = Stream.of(owner.getCity(), owner.getState(), owner.getZipCode())
                    .filter(s -> s != null && !s.isBlank())
                    .collect(Collectors.joining(", "));
            if (!cityLine.isBlank()) {
                doc.add(new Paragraph(cityLine, addrFont));
            }
            doc.add(Chunk.NEWLINE);

            // ── Body content ───────────────────────────────────────────
            // No "Re: <subject>" line — the mailing has no visible subject.
            String body = message.getBody()
                    .replace("{{name}}", owner.getName())
                    .replace("{{unit}}", owner.getUnitNumber() != null ? owner.getUnitNumber() : "");

            doc.add(new Paragraph(body, bodyFont));
            doc.close();

        } catch (DocumentException e) {
            throw new RuntimeException("PDF generation failed for owner " + owner.getOwnerId(), e);
        }

        return out.toByteArray();
    }
}