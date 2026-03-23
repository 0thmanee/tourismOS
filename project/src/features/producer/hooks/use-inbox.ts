"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
	BookingDetailRow,
	CreateBookingInput,
	MarkDepositInput,
	SendBookingMessageInput,
	UpdateBookingStatusInput,
} from "~/app/api/bookings";
import { listMyActivities } from "~/app/api/activities";
import {
	cancelBooking,
	confirmBooking,
	createBooking,
	getMyBookingDetail,
	listMyBookingsForInbox,
	markDeposit,
	sendBookingMessage,
} from "~/app/api/bookings";

export const producerActivitiesQueryKey = [
	"producer",
	"activities",
] as const;

export function useProducerActivities() {
	return useQuery({
		queryKey: producerActivitiesQueryKey,
		queryFn: () => listMyActivities(false),
	});
}

export const producerInboxBookingsQueryKey = [
	"producer",
	"inbox",
	"bookings",
] as const;
const producerInboxBookingDetailPrefix = [
	...producerInboxBookingsQueryKey,
	"detail",
] as const;

export function producerInboxBookingDetailQueryKey(bookingId: string | null) {
	return [...producerInboxBookingsQueryKey, "detail", bookingId ?? ""] as const;
}

export function useInboxBookings() {
	return useQuery({
		queryKey: producerInboxBookingsQueryKey,
		queryFn: listMyBookingsForInbox,
	});
}

export function useInboxBookingDetail(bookingId: string | null) {
	return useQuery<BookingDetailRow | null>({
		queryKey: producerInboxBookingDetailQueryKey(bookingId),
		queryFn: () =>
			bookingId ? getMyBookingDetail(bookingId) : Promise.resolve(null),
		enabled: !!bookingId,
	});
}

export function useCreateBooking() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (data: CreateBookingInput) => createBooking(data),
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: producerInboxBookingsQueryKey,
			});
			void queryClient.invalidateQueries({
				queryKey: producerInboxBookingDetailPrefix,
				exact: false,
			});
			void queryClient.invalidateQueries({ queryKey: producerActivitiesQueryKey });
			void queryClient.invalidateQueries({ queryKey: ["producer"] });
		},
	});
}

export function useConfirmBooking() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (input: UpdateBookingStatusInput) => confirmBooking(input),
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: producerInboxBookingsQueryKey,
			});
			void queryClient.invalidateQueries({
				queryKey: producerInboxBookingDetailPrefix,
				exact: false,
			});
			void queryClient.invalidateQueries({ queryKey: ["producer"] });
		},
	});
}

export function useCancelBooking() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (input: UpdateBookingStatusInput) => cancelBooking(input),
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: producerInboxBookingsQueryKey,
			});
			void queryClient.invalidateQueries({
				queryKey: producerInboxBookingDetailPrefix,
				exact: false,
			});
			void queryClient.invalidateQueries({ queryKey: ["producer"] });
		},
	});
}

export function useMarkDeposit() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (input: MarkDepositInput) => markDeposit(input),
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: producerInboxBookingsQueryKey,
			});
			void queryClient.invalidateQueries({
				queryKey: producerInboxBookingDetailPrefix,
				exact: false,
			});
			void queryClient.invalidateQueries({ queryKey: ["producer"] });
		},
	});
}

export function useSendBookingMessage() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (input: SendBookingMessageInput) => sendBookingMessage(input),
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: producerInboxBookingDetailPrefix,
				exact: false,
			});
		},
	});
}
