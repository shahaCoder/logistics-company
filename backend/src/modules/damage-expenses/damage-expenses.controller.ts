import { Router } from "express";
import { authRequired } from "../auth/auth.middleware.js";
import prisma from "../../utils/prisma.js";
import multer from "multer";
import { uploadDriverFile } from "../../services/cloudinary.js";

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

// GET /api/admin/damage-expenses
router.get("/damage-expenses", authRequired("MANAGER"), async (req, res) => {
  try {
    const { page = "1", pageSize = "20" } = req.query;

    const take = Number(pageSize);
    const skip = (Number(page) - 1) * take;

    const [items, total] = await Promise.all([
      prisma.damageExpense.findMany({
        orderBy: { dateReported: "desc" },
        skip,
        take,
      }),
      prisma.damageExpense.count(),
    ]);

    res.json({ success: true, data: items, total });
  } catch (err) {
    console.error("Error fetching damage expenses", err);
    res
      .status(500)
      .json({ success: false, error: "Failed to load damage expenses" });
  }
});

// POST /api/admin/damage-expenses
router.post("/damage-expenses", authRequired("MANAGER"), async (req, res) => {
  try {
    const {
      vehicleId,
      vehicleType,
      dateReported,
      category,
      description,
      totalCost,
      companyShare,
      driverShare,
      responsibleDriverId,
      driverLiabilityType,
      status,
      photos,
      invoices,
      repairEstimates,
      receipts,
      severity,
      paid,
      insuranceClaimNumber,
      insuranceCoveredAmount,
      insuranceDeductible,
      insuranceStatus,
    } = req.body;

    const expense = await prisma.damageExpense.create({
      data: {
        vehicleId,
        vehicleType,
        dateReported: new Date(dateReported),
        category,
        description,
        totalCost,
        companyShare,
        driverShare,
        responsibleDriverId: responsibleDriverId || null,
        driverLiabilityType: driverLiabilityType || "NONE",
        status: status || "OPEN",
        photos: Array.isArray(photos) ? photos : undefined,
        invoices: Array.isArray(invoices) ? invoices : undefined,
        repairEstimates: Array.isArray(repairEstimates)
          ? repairEstimates
          : undefined,
        receipts: Array.isArray(receipts) ? receipts : undefined,
        severity: severity || "MINOR",
        paid: paid ?? false,
        insuranceClaimNumber: insuranceClaimNumber || null,
        insuranceCoveredAmount: insuranceCoveredAmount ?? null,
        insuranceDeductible: insuranceDeductible ?? null,
        insuranceStatus: insuranceStatus || null,
      },
    });

    res.status(201).json({ success: true, data: expense });
  } catch (err) {
    console.error("Error creating damage expense", err);
    res
      .status(500)
      .json({ success: false, error: "Failed to create damage expense" });
  }
});

// PATCH /api/admin/damage-expenses/:id
router.patch(
  "/damage-expenses/:id",
  authRequired("MANAGER"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const {
        vehicleId,
        vehicleType,
        dateReported,
        category,
        description,
        totalCost,
        companyShare,
        driverShare,
        responsibleDriverId,
        driverLiabilityType,
        status,
        photos,
        invoices,
        repairEstimates,
        receipts,
        severity,
        paid,
        insuranceClaimNumber,
        insuranceCoveredAmount,
        insuranceDeductible,
        insuranceStatus,
      } = req.body;

      const expense = await prisma.damageExpense.update({
        where: { id },
        data: {
          vehicleId,
          vehicleType,
          dateReported: dateReported
            ? new Date(dateReported)
            : undefined,
          category,
          description,
          totalCost,
          companyShare,
          driverShare,
          responsibleDriverId:
            responsibleDriverId === undefined
              ? undefined
              : responsibleDriverId || null,
          driverLiabilityType,
          status,
          photos: photos === undefined ? undefined : photos,
          invoices: invoices === undefined ? undefined : invoices,
          repairEstimates:
            repairEstimates === undefined ? undefined : repairEstimates,
          receipts: receipts === undefined ? undefined : receipts,
          severity,
          paid,
          insuranceClaimNumber,
          insuranceCoveredAmount,
          insuranceDeductible,
          insuranceStatus,
        },
      });

      res.json({ success: true, data: expense });
    } catch (err) {
      console.error("Error updating damage expense", err);
      res
        .status(500)
        .json({ success: false, error: "Failed to update damage expense" });
    }
  }
);

// GET /api/admin/damage-expenses/:id
router.get(
  "/damage-expenses/:id",
  authRequired("MANAGER"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const expense = await prisma.damageExpense.findUnique({
        where: { id },
      });

      if (!expense) {
        return res
          .status(404)
          .json({ success: false, error: "Damage expense not found" });
      }

      res.json({ success: true, data: expense });
    } catch (err) {
      console.error("Error fetching damage expense by id", err);
      res
        .status(500)
        .json({ success: false, error: "Failed to load damage expense" });
    }
  }
);

// POST /api/admin/damage-expenses/photos
router.post(
  "/damage-expenses/photos",
  authRequired("MANAGER"),
  upload.array("files", 5),
  async (req, res) => {
    try {
      const files = (req.files as Express.Multer.File[]) || [];
      if (!files.length) {
        return res.status(400).json({ success: false, error: "No files uploaded" });
      }

      const uploads = await Promise.all(
        files.map((file) =>
          uploadDriverFile(file.buffer, { folder: "damage_expenses", resourceType: "image" }).catch(
            (err) => {
              console.error("Error uploading damage expense photo", err);
              return null;
            }
          )
        )
      );

      const successful = uploads.filter((u) => u !== null) as { url: string; publicId: string }[];

      if (!successful.length) {
        return res
          .status(500)
          .json({ success: false, error: "Failed to upload photos" });
      }

      res.json({
        success: true,
        photos: successful.map((u) => u.url),
      });
    } catch (err) {
      console.error("Error uploading damage expense photos", err);
      res
        .status(500)
        .json({ success: false, error: "Failed to upload photos" });
    }
  }
);

// POST /api/admin/damage-expenses/documents?kind=invoice|estimate|receipt
router.post(
  "/damage-expenses/documents",
  authRequired("MANAGER"),
  upload.array("files", 5),
  async (req, res) => {
    try {
      const kind = (req.query.kind as string | undefined) ?? "invoice";
      const files = (req.files as Express.Multer.File[]) || [];
      if (!files.length) {
        return res
          .status(400)
          .json({ success: false, error: "No files uploaded" });
      }

      const folder =
        kind === "estimate"
          ? "damage_expenses/estimates"
          : kind === "receipt"
          ? "damage_expenses/receipts"
          : "damage_expenses/invoices";

      const uploads = await Promise.all(
        files.map((file) =>
          uploadDriverFile(file.buffer, {
            folder,
            resourceType: "raw",
          }).catch((err) => {
            console.error("Error uploading damage expense document", err);
            return null;
          })
        )
      );

      const successful = uploads.filter(
        (u) => u !== null
      ) as { url: string; publicId: string }[];

      if (!successful.length) {
        return res
          .status(500)
          .json({ success: false, error: "Failed to upload documents" });
      }

      res.json({
        success: true,
        documents: successful.map((u) => u.url),
      });
    } catch (err) {
      console.error("Error uploading damage expense documents", err);
      res
        .status(500)
        .json({ success: false, error: "Failed to upload documents" });
    }
  }
);

// DELETE /api/admin/damage-expenses/:id
router.delete(
  "/damage-expenses/:id",
  authRequired("MANAGER"),
  async (req, res) => {
    try {
      const { id } = req.params;
      await prisma.damageExpense.delete({ where: { id } });
      res.json({ success: true });
    } catch (err) {
      console.error("Error deleting damage expense", err);
      res
        .status(500)
        .json({ success: false, error: "Failed to delete damage expense" });
    }
  }
);

export default router;

