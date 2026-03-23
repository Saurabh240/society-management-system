package com.gstech.saas.communication.service;

import com.gstech.saas.associations.association.model.Association;
import com.gstech.saas.associations.association.repository.AssociationRepository;
import com.gstech.saas.associations.owner.repository.UnitOwnerRepository;
import com.gstech.saas.communication.dto.OwnerDto;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class OwnerLookupServiceImpl implements OwnerLookupService {

    private final UnitOwnerRepository unitOwnerRepository;
    private final AssociationRepository associationRepository;

    @Override
    @Transactional
    public List<OwnerDto> findOwnersByAssociation(Long associationId) {
        return unitOwnerRepository
                .findActiveOwnersByAssociationId(associationId)
                .stream()
                .map(uo -> OwnerDto.builder()
                        .ownerId(uo.getOwner().getId())
                        .name(uo.getOwner().getFirstName() + " " + uo.getOwner().getLastName())
                        .unitNumber(uo.getUnit().getUnitNumber())
                        .email(uo.getOwner().getEmail())
                        .build())
                .toList();
    }

    @Override
    public String getAssociationName(Long associationId) {
        return associationRepository.findById(associationId).map(Association::getName).orElse("Unknown");
    }
}