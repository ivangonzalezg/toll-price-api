import { Request, Response, NextFunction, Application } from "express";
import {
  findNearbyTolls,
  aggregateTollPrices,
} from "../services/tolls.service";
import { Database } from "../database";
import { Toll } from "../models/toll.model";
import { Price } from "../models/price.model";
import Joi from "joi";
import { decode } from "@mapbox/polyline";

const getTollPricesSchema = Joi.object<{
  polyline: string;
  vehicleType: string;
}>({
  polyline: Joi.string().required().messages({
    "string.base": "Polyline must be a string",
    "string.empty": "Polyline cannot be empty",
    "any.required": "Polyline is required",
  }),
  vehicleType: Joi.string().required().messages({
    "string.base": "Vehicle type must be a string",
    "string.empty": "Vehicle type cannot be empty",
    "any.required": "Vehicle type is required",
  }),
});

const addTollSchema = Joi.object({
  name: Joi.string().required().messages({
    "string.base": "Name must be a string",
    "string.empty": "Name cannot be empty",
    "any.required": "Name is required",
  }),
  latitude: Joi.number().required().messages({
    "number.base": "Latitude must be a number",
    "any.required": "Latitude is required",
  }),
  longitude: Joi.number().required().messages({
    "number.base": "Longitude must be a number",
    "any.required": "Longitude is required",
  }),
  prices: Joi.array()
    .items(
      Joi.object({
        vehicleType: Joi.string().required().messages({
          "string.base": "Vehicle type must be a string",
          "string.empty": "Vehicle type cannot be empty",
          "any.required": "Vehicle type is required",
        }),
        amount: Joi.number().required().messages({
          "number.base": "Amount must be a number",
          "any.required": "Amount is required",
        }),
        currency: Joi.string().required().messages({
          "string.base": "Currency must be a string",
          "string.empty": "Currency cannot be empty",
          "any.required": "Currency is required",
        }),
      })
    )
    .required()
    .messages({
      "array.base": "Prices must be an array",
      "any.required": "Prices are required",
    }),
});

export const listTolls = async (
  _: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const tolls = await Database.getRepository(Toll).find({
      relations: ["prices"],
    });
    return res.status(200).json(tolls);
  } catch (error) {
    next(error);
  }
};

export const getTollById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const toll = await Database.getRepository(Toll).findOne({
      where: { id: parseInt(id) },
      relations: ["prices"],
    });

    if (!toll) {
      return res.status(404).json({ error: "Toll not found" });
    }

    return res.status(200).json(toll);
  } catch (error) {
    next(error);
  }
};

export const getTollPrices = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { error, value } = getTollPricesSchema.validate(req.body, {
      abortEarly: false,
    });

    if (error) {
      return res.status(400).json({
        error: "Validation error",
        details: error.details.map((err) => err.message),
      });
    }

    const { polyline, vehicleType } = value;
    const coordinates = decode(polyline);
    const tollsIds = await findNearbyTolls(coordinates);
    if (!tollsIds.length) {
      return res.status(200).json({ cost: 0, tolls: [] });
    }
    const tollsAndPrice = await Database.getRepository(Toll)
      .createQueryBuilder("toll")
      .leftJoinAndSelect("toll.prices", "price")
      .where("toll.id IN (:...tollIds)", {
        tollIds: tollsIds.map((tollsId) => tollsId.id),
      })
      .andWhere("price.vehicleType = :vehicleType", { vehicleType })
      .getMany();
    const tolls = tollsAndPrice.map((tollAndPrice) => {
      const price = tollAndPrice.prices[0];
      return {
        id: price.id,
        name: tollAndPrice.name,
        latitude: tollAndPrice.latitude,
        longitude: tollAndPrice.longitude,
        amount: Number(price.amount),
        currency: price.currency,
      };
    });
    const cost = tolls.reduce((total, toll) => total + toll.amount, 0);
    return res.status(200).json({ cost, tolls });
  } catch (error) {
    next(error);
  }
};

export const addToll = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { error, value } = addTollSchema.validate(req.body, {
      abortEarly: false,
    });

    if (error) {
      return res.status(400).json({
        error: "Validation error",
        details: error.details.map((err) => err.message),
      });
    }

    const { name, latitude, longitude, prices } = value;

    const tollRepository = Database.getRepository(Toll);
    const priceRepository = Database.getRepository(Price);

    const toll = tollRepository.create({
      name,
      latitude,
      longitude,
    });

    const savedToll = await tollRepository.save(toll);

    const priceEntities = prices.map((price: any) => {
      return priceRepository.create({
        toll: savedToll,
        vehicleType: price.vehicleType,
        amount: price.amount,
        currency: price.currency,
      });
    });

    await priceRepository.save(priceEntities);

    return res.status(201).json({
      message: "Toll added successfully",
      toll: savedToll,
      prices: priceEntities,
    });
  } catch (error) {
    next(error);
  }
};

export const updateToll = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { name, latitude, longitude, prices } = req.body;

    if (!id) {
      return res.status(400).json({ error: "Toll ID is required" });
    }

    const tollRepository = Database.getRepository(Toll);
    const priceRepository = Database.getRepository(Price);

    const toll = await tollRepository.findOne({
      where: { id: parseInt(id) },
      relations: ["prices"],
    });

    if (!toll) {
      return res.status(404).json({ error: "Toll not found" });
    }

    if (name) toll.name = name;
    if (latitude) toll.latitude = latitude;
    if (longitude) toll.longitude = longitude;

    const updatedToll = await tollRepository.save(toll);

    if (Array.isArray(prices)) {
      await priceRepository.delete({ toll: toll });

      const priceEntities = prices.map((price: any) => {
        return priceRepository.create({
          toll: updatedToll,
          vehicleType: price.vehicleType,
          amount: price.amount,
          currency: price.currency,
        });
      });

      await priceRepository.save(priceEntities);

      return res.status(200).json({
        message: "Toll updated successfully",
        toll: updatedToll,
        prices: priceEntities,
      });
    }

    return res
      .status(200)
      .json({ message: "Toll updated successfully", toll: updatedToll });
  } catch (error) {
    next(error);
  }
};
