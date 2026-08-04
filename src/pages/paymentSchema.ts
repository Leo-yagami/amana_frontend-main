import { z } from "zod";
import type { TFunction } from "i18next";

export const createPaymentSchema = (t: TFunction) =>
  z
    .object({
      // selectedAmount: z.coerce.number().min(1),
      // customAmount: z.string().optional(),
      selectedAmount: z.coerce.number(),
      // customAmount: z.number().optional().transform((val)=> (val === 0? undefined: val)),
      customAmount: z.number().optional().nullable(),
      paymentMethod: z.enum(["card", "telebirr"]),
      telebirrPhone: z.string().optional(),
      cardNumber: z.string().optional(),
      expiryDate: z.string().optional(),
      cvv: z.string().optional(),
      eventId: z.string().optional(),
      familyClassification: z
        .enum(["orphan", "disabled_disease", "old_age", "single_mother"])
        .nullable()
        .optional(),
    })
    .superRefine((data, ctx) => {
      // if (data.customAmount && data.customAmount.trim() !== "") {
      //   const custom = Number(data.customAmount);
      //   if (Number.isNaN(custom)) {
      //     ctx.addIssue({
      //       code: "custom",
      //       path: ["customAmount"],
      //       message: t("paymentValidation.customNaN"),
      //     });
      //   } else if (custom <= 0) {
      //     ctx.addIssue({
      //       code: "custom",
      //       path: ["customAmount"],
      //       message: t("paymentValidation.customPositive"),
      //     });
      //   } else if (custom > 100000) {
      //     ctx.addIssue({
      //       code: "custom",
      //       path: ["customAmount"],
      //       message: t("paymentValidation.customLarge"),
      //     });
      //   }
      // }
      if (data.customAmount !== undefined) {
        const custom = data.customAmount;

        if (Number.isNaN(custom)) {
          ctx.addIssue({
            code: "custom",
            path: ["customAmount"],
            message: t("paymentValidation.customNaN"),
          });
        } else if (custom <= 0) {
          ctx.addIssue({
            code: "custom",
            path: ["customAmount"],
            message: t("paymentValidation.customPositive"),
          });
        } else if (custom > 100000) {
          ctx.addIssue({
            code: "custom",
            path: ["customAmount"],
            message: t("paymentValidation.customLarge"),
          });
        }
      }

      if (data.paymentMethod === "telebirr") {
        if (!data.telebirrPhone || data.telebirrPhone.trim() === "") {
          ctx.addIssue({
            code: "custom",
            path: ["telebirrPhone"],
            message: t("paymentValidation.telebirrRequired"),
          });
        } else if (!/^09\d{8}$/.test(data.telebirrPhone)) {
          ctx.addIssue({
            code: "custom",
            path: ["telebirrPhone"],
            message: t("paymentValidation.telebirrFormat"),
          });
        }
      }

      if (data.paymentMethod === "card") {
        if (!data.cardNumber || data.cardNumber.trim() === "") {
          ctx.addIssue({
            code: "custom",
            path: ["cardNumber"],
            message: t("paymentValidation.cardRequired"),
          });
        } else if (!/^\d{16}$/.test(data.cardNumber.replace(/\s/g, ""))) {
          ctx.addIssue({
            code: "custom",
            path: ["cardNumber"],
            message: t("paymentValidation.cardDigits"),
          });
        }

        if (!data.expiryDate || data.expiryDate.trim() === "") {
          ctx.addIssue({
            code: "custom",
            path: ["expiryDate"],
            message: t("paymentValidation.expiryRequired"),
          });
        } else if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(data.expiryDate.replace(/\s/g, ""))) {
          ctx.addIssue({
            code: "custom",
            path: ["expiryDate"],
            message: t("paymentValidation.expiryFormat"),
          });
        }

        if (!data.cvv || data.cvv.trim() === "") {
          ctx.addIssue({
            code: "custom",
            path: ["cvv"],
            message: t("paymentValidation.cvvRequired"),
          });
        } else if (!/^\d{3,4}$/.test(data.cvv)) {
          ctx.addIssue({
            code: "custom",
            path: ["cvv"],
            message: t("paymentValidation.cvvDigits"),
          });
        }
      }
    });
