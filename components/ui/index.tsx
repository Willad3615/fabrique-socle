/**
 * Composants du socle.
 *
 * Règle du Builder : on assemble ces composants, on ne les réécrit pas, et on
 * n'écrit jamais de couleur, de taille ni de rayon en dur dans une page. Toute
 * nouvelle variante se fabrique ici, pour tous les sites à la fois.
 */
import * as React from "react";

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

/* ---------------------------------- Button --------------------------------- */

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "outline" | "ghost";
  size?: "sm" | "md";
};

export function Button({ variant = "primary", size = "md", className, ...props }: ButtonProps) {
  return (
    <button
      className={cx(
        "inline-flex items-center justify-center gap-2 rounded-theme font-medium transition-colors",
        "disabled:cursor-not-allowed disabled:opacity-55",
        size === "sm" ? "px-3 py-1.5 text-sm" : "px-4 py-2.5 text-base",
        variant === "primary" && "bg-accent text-on-accent hover:opacity-90",
        variant === "outline" && "rule-strong text-ink hover:bg-surface-alt",
        variant === "ghost" && "text-accent hover:bg-surface-alt",
        className,
      )}
      {...props}
    />
  );
}

/* ----------------------------------- Card ---------------------------------- */

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cx("rule rounded-theme-lg bg-surface p-6 shadow-card", className)} {...props} />;
}

export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cx("mb-2 text-lg", className)} {...props} />;
}

export function CardBody({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cx("text-muted", className)} {...props} />;
}

/* ---------------------------------- Badge ---------------------------------- */

const TONES = {
  neutral: "text-muted",
  ok: "text-ok",
  warn: "text-warn",
  danger: "text-danger",
  accent: "text-accent",
} as const;

export function Badge({
  tone = "neutral",
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { tone?: keyof typeof TONES }) {
  return (
    <span
      className={cx("inline-block rounded-theme bg-surface-alt px-2 py-0.5 font-mono text-xs", TONES[tone], className)}
      {...props}
    />
  );
}

/* ---------------------------------- Field ---------------------------------- */

type FieldProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "id"> & {
  label: string;
  hint?: string;
  error?: string;
  id?: string;
};

export function Field({ label, hint, error, id, className, ...props }: FieldProps) {
  const reactId = React.useId();
  const fieldId = id ?? reactId;
  const hintId = hint ? `${fieldId}-hint` : undefined;
  const errorId = error ? `${fieldId}-error` : undefined;

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={fieldId} className="font-medium">
        {label}
      </label>
      {hint && (
        <span id={hintId} className="text-sm text-muted">
          {hint}
        </span>
      )}
      <input
        id={fieldId}
        aria-describedby={cx(hintId, errorId) || undefined}
        aria-invalid={error ? true : undefined}
        className={cx(
          "rounded-theme bg-surface px-3 py-2 text-ink",
          error ? "rule-strong border-danger" : "rule-strong",
          className,
        )}
        {...props}
      />
      {/* Un message d'erreur dit ce qui ne va pas ET comment le corriger. */}
      {error && (
        <span id={errorId} role="alert" className="text-sm text-danger">
          {error}
        </span>
      )}
    </div>
  );
}
