import { z } from "zod";

export const SettingSchema = z.object({
	publishDomain: z.string().default(""),
	theogTemplate: z.number().default(3),
});
