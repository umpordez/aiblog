import { z, ZodError } from '/lib/zod3.23.8.js';

export function validateZodSchema(
    Schema: z.ZodObject<z.ZodRawShape>,
    obj: object,
    form?: HTMLFormElement | null
) : void {
    try {
        if (form) {
            for (const field of form) {
                if (field instanceof HTMLInputElement ||
                    field instanceof HTMLTextAreaElement
                ) { field.classList.remove('invalid'); }
            }
        }

        Schema.parse(obj);
    } catch (ex) {
        console.error(ex);

        if (form) {
            if (ex instanceof ZodError) {
                let hasSetFocus = false;

                for (const err of ex.errors) {
                    for (const path of err.path) {
                        const el = Array
                            .from(form)
                            .filter((i) =>
                                i instanceof HTMLInputElement ||
                                i instanceof HTMLTextAreaElement
                            )
                            .find((i: HTMLInputElement | HTMLTextAreaElement) =>
                                i.name === path
                            );

                        if (!el) { continue; }
                        el.classList.add('invalid');

                        if (!hasSetFocus) { el.focus(); }
                        hasSetFocus = true;
                    }
                }
            }
        }

        if (ex instanceof ZodError) {
            const message = ex.errors
                .map((err) => `(field: '${err.path[0]}') ${err.message}`)
                .join('\n');

            alert(message);
        } else if (ex instanceof Error) {
            alert(ex.message)
        }

        throw ex;
    }
}