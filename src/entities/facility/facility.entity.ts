import {
    Column,
    Entity,
    PrimaryGeneratedColumn,
    Index,
    OneToMany
} from 'typeorm';
import { BaseEntity } from '../base/base.entity';
import { FacilityAttribute } from './facility-attribute.entity';
import { FacilityBranchSite } from './facility-branch-site.entity';
import { FacilityAgreement } from './facility-agreement.entity';
import { FacilityDocumentRequired } from './facility-document-required.entity';
import { FacilityRule } from './facility-rule.entity';
import { FacilityOrganizationStructure } from './facility-organization-structure.entity';

@Entity('facility', { orderBy: { facility_id: 'DESC' } })
@Index(['facility_id'])
export class Facility extends BaseEntity {

    @PrimaryGeneratedColumn({ type: 'int', name: 'facility_id' })
    facility_id: number;

    @Column({
        type: 'varchar',
        length: 255,
        nullable: false,
        name: 'organization_name',
        comment: 'Organization name'
    })
    organization_name: string;

    @Column({
        type: 'varchar',
        length: 255,
        nullable: true,
        name: 'registered_business_name',
        comment: 'Registered business name'
    })
    registered_business_name: string;

    @Column({
        type: 'varchar',
        length: 255,
        nullable: true,
        name: 'website_url',
        comment: 'Website URL'
    })
    website_url: string;

    @Column({
        type: 'varchar',
        length: 50,
        nullable: true,
        name: 'abn_registration_number',
        comment: 'ABN registration number'
    })
    abn_registration_number: string;

    @Column({
        type: 'varchar',
        length: 255,
        nullable: true,
        name: 'source_of_data',
        comment: 'Source of data'
    })
    source_of_data: string;

    // Relations
    @OneToMany(() => FacilityAttribute, attribute => attribute.facility)
    attributes: FacilityAttribute[];

    @OneToMany(() => FacilityOrganizationStructure, orgStructure => orgStructure.facility)
    organizationStructures: FacilityOrganizationStructure[];

    @OneToMany(() => FacilityBranchSite, branch => branch.facility)
    branches: FacilityBranchSite[];

    @OneToMany(() => FacilityAgreement, agreement => agreement.facility)
    agreements: FacilityAgreement[];

    @OneToMany(() => FacilityDocumentRequired, document => document.facility)
    documentsRequired: FacilityDocumentRequired[];

    @OneToMany(() => FacilityRule, rule => rule.facility)
    rules: FacilityRule[];

    toJSON() {
        const { ...result } = this;
        return result;
    }
}
