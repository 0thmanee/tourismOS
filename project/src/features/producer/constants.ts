export const PRODUCT_STATUS_STYLES: Record<
	string,
	{ bg: string; color: string; border: string }
> = {
	APPROVED: {
		bg: "rgba(26,71,49,0.8)",
		color: "#4ADE80",
		border: "1px solid rgba(74,222,128,0.25)",
	},
	PENDING: {
		bg: "rgba(201,145,61,0.2)",
		color: "#E8B84B",
		border: "1px solid rgba(201,145,61,0.3)",
	},
	REJECTED: {
		bg: "rgba(180,30,30,0.2)",
		color: "#f87171",
		border: "1px solid rgba(248,113,113,0.25)",
	},
};

export const STATUS_DOT_COLORS: Record<string, string> = {
	APPROVED: "#C9913D",
	PENDING: "#E8B84B",
	REJECTED: "#f87171",
};
