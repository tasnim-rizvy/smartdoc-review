import { Request, Response } from "express";
import crypto from "crypto";
import { AuthRequest } from "../types";
import { getPool } from "../db/postgres";
import { QueryLog } from "../models/QueryLog";
import { createError } from "../middlewares/error.middleware";