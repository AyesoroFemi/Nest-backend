import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export enum KnowUs {
  GOOGLE = 'google',
  FACEBOOK = 'facebook',
  TWITTER = 'twitter',
  LINKEDIN = 'linkedin',
  OTHER = 'other',
}

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column()
  password: string;

  @Column({
    type: 'enum',
    enum: KnowUs,
    default: KnowUs.FACEBOOK,
  })
  knowUs: KnowUs;
}
