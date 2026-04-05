package com.gstech.saas.communication.service;

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

            // Recipient address block (top of letter)
            doc.add(new Paragraph(owner.getName(), headerFont));
            doc.add(new Paragraph(owner.getUnitNumber(), addrFont));
            doc.add(Chunk.NEWLINE);

            // Subject line
            Paragraph subject = new Paragraph("Re: " + message.getTitle(), headerFont);
            doc.add(subject);
            doc.add(Chunk.NEWLINE);

            // Body content — replace {{name}} placeholder if present
            String body = message.getBody()
                    .replace("{{name}}", owner.getName())
                    .replace("{{unit}}", owner.getUnitNumber());

            doc.add(new Paragraph(body, bodyFont));
            doc.close();

        } catch (DocumentException e) {
            throw new RuntimeException("PDF generation failed for owner " + owner.getOwnerId(), e);
        }

        return out.toByteArray();
    }
}