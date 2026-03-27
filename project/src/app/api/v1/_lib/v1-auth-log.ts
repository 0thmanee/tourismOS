export function v1AuthRequestId(): string {
	return crypto.randomUUID().slice(0, 8);
}

export function v1AuthRequestHints(request: Request) {
	const authHeader = request.headers.get("authorization");
	const hasBearer =
		typeof authHeader === "string" && /^Bearer\s+\S+/.test(authHeader);
	return {
		hasBearer,
		hasCookie: request.headers.has("cookie"),
	};
}
