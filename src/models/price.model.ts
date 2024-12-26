import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  Index,
} from "typeorm";
import { Toll } from "./toll.model";

@Entity("prices")
@Index("unique_toll_vehicleType", ["toll", "vehicleType"], { unique: true })
export class Price {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Toll, (toll) => toll.prices)
  toll: Toll;

  @Column({ type: "varchar" })
  vehicleType: string;

  @Column({ type: "decimal", precision: 10, scale: 6 })
  amount: number;

  @Column({ type: "varchar" })
  currency: string;
}
