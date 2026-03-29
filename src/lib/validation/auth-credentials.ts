import { z } from "zod";

/** Simple email + password (e.g. API boundaries). */
export const authCredentialsSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(8).max(128),
});

export type AuthCredentialsInput = z.infer<typeof authCredentialsSchema>;

export type AuthLoginFormMessages = {
  passwordMismatch: string;
  passwordConfirmRequired: string;
};

const baseAuthLoginFields = z.object({
  mode: z.enum(["signin", "signup"]),
  email: z.string().email().max(255),
  password: z.string().min(8).max(128),
  passwordConfirm: z.string().optional(),
});

/**
 * `getMessages` is invoked at validation time so locale can change without
 * recreating the Zod schema (stable resolver for react-hook-form).
 */
export function createAuthLoginFormSchema(
  getMessages: () => AuthLoginFormMessages
) {
  return baseAuthLoginFields.superRefine((data, ctx) => {
    if (data.mode !== "signup") return;
    const { passwordMismatch, passwordConfirmRequired } = getMessages();
    const c = (data.passwordConfirm ?? "").trim();
    if (c.length < 8) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: passwordConfirmRequired,
        path: ["passwordConfirm"],
      });
      return;
    }
    if (c !== data.password) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: passwordMismatch,
        path: ["passwordConfirm"],
      });
    }
  });
}

export type AuthLoginFormInput = z.input<typeof baseAuthLoginFields>;
