import { AreaEntity } from 'src/areas/entities/area.entity';
import { BaseEntity } from 'src/helpers/entities/baseEntity.entity';
import { PropertyEntity } from 'src/property/entities/property.entity';
import { Column, Entity, ManyToOne } from 'typeorm';

@Entity({ name: 'medias' })
export class MediaEntity extends BaseEntity {
  @Column({ nullable: false })
  fileName: string;

  @Column({ nullable: false })
  filePath: string;

  @Column({ nullable: false })
  mimeType: string;

  @Column({ nullable: false })
  size: string;

  @Column({ nullable: false })
  originalName: string;

  @Column({ type: 'uuid', nullable: true })
  areaId: string;

  @Column({ type: 'uuid', nullable: true })
  propertyId: string;

  @ManyToOne(() => AreaEntity, (area) => area.medias, { onDelete: 'CASCADE' })
  area: AreaEntity;

  @ManyToOne(() => PropertyEntity, (property) => property.medias, {
    onDelete: 'CASCADE',
  })
  property: PropertyEntity;
}
