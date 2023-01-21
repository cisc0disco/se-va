import { Request, Response, Router } from "express";
const router = Router();

// returns logs by defined FROM/TO parameters
router.get("/", function (req: Request, res: Response) {
  res.sendStatus(200);
});
