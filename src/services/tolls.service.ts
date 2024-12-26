import { Toll } from "../models/toll.model";
import { Database } from "../database";

export const findNearbyTolls = async (
  coordinates: [number, number][]
): Promise<Toll[]> => {
  const queryRunner = Database.createQueryRunner();
  const pointsArray = coordinates
    .map(([lat, lng]) => `ST_MakePoint(${lng}, ${lat})`)
    .join(",");

  const query = `
    SELECT id
    FROM tolls
    WHERE ST_DWithin(
      geography(ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)),
      geography(ST_SetSRID(
        ST_MakeLine(ARRAY[${pointsArray}]::geometry[]),
        4326
      )),
      100
    )
  `;

  const tolls = await queryRunner.manager.query(query);
  await queryRunner.release();
  return tolls;
};

export const aggregateTollPrices = (tolls: Toll[]): any => {
  const result: Record<string, Record<string, number>> = {};
  tolls.forEach((toll) => {
    result[toll.name] = {};
    toll.prices.forEach((price) => {
      result[toll.name][price.vehicleType] = price.amount;
    });
  });
  return result;
};
