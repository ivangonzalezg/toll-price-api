import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  Index,
} from "typeorm";
import { Price } from "./price.model";

@Entity("tolls")
@Index("unique_latitude_longitude", ["latitude", "longitude"], { unique: true })
export class Toll {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar" })
  name: string;

  @Column({ type: "decimal", precision: 10, scale: 6 })
  latitude: number;

  @Column({ type: "decimal", precision: 10, scale: 6 })
  longitude: number;

  @OneToMany(() => Price, (price) => price.toll, { eager: true })
  prices: Price[];
}
