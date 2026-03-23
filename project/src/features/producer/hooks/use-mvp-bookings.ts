"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  listMyBookingsFiltered,
  listMyBookingsForCalendar,
  markBookingPaid,
  updateBooking,
} from "~/app/api/bookings";
import type { BookingsFilterInput, CalendarRangeInput } from "~/app/api/bookings";
import { producerInboxBookingsQueryKey } from "./use-inbox";

export const producerBookingsFilterQueryKey = (filters: BookingsFilterInput) =>
  ["producer", "bookings", "filtered", filters] as const;

export const producerCalendarQueryKey = (range: CalendarRangeInput) =>
  ["producer", "calendar", range.rangeStartISO, range.rangeEndISO] as const;

export function useFilteredBookings(filters: BookingsFilterInput) {
  return useQuery({
    queryKey: producerBookingsFilterQueryKey(filters),
    queryFn: () => listMyBookingsFiltered(filters),
  });
}

export function useCalendarBookings(range: CalendarRangeInput | null) {
  return useQuery({
    queryKey: range ? producerCalendarQueryKey(range) : ["producer", "calendar", "idle"],
    queryFn: () => (range ? listMyBookingsForCalendar(range) : Promise.resolve([])),
    enabled: !!range,
  });
}

export function useUpdateBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateBooking,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: producerInboxBookingsQueryKey });
      void queryClient.invalidateQueries({ queryKey: ["producer"] });
    },
  });
}

export function useMarkBookingPaid() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markBookingPaid,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: producerInboxBookingsQueryKey });
      void queryClient.invalidateQueries({ queryKey: ["producer"] });
    },
  });
}
