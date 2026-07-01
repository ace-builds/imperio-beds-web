import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  listPayroll,
  payPayrollEntry,
  runPayroll,
  setStaffSalary,
  updatePayrollEntry,
} from '@/lib/api/payroll'
import type { SetStaffSalaryInput, UpdatePayrollEntryInput } from '@/lib/schemas/payroll'

export function usePayroll(hotelId: string, period: string) {
  return useQuery({
    queryKey: ['hotels', hotelId, 'payroll', period],
    queryFn: () => listPayroll(hotelId, period),
    enabled: !!hotelId && !!period,
  })
}

export function useSetStaffSalary(hotelId: string, period: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ staffId, input }: { staffId: string; input: SetStaffSalaryInput }) =>
      setStaffSalary(hotelId, staffId, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['hotels', hotelId, 'payroll', period] })
    },
  })
}

export function useRunPayroll(hotelId: string, period: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => runPayroll(hotelId, period),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['hotels', hotelId, 'payroll', period] })
    },
  })
}

export function useUpdatePayrollEntry(hotelId: string, period: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ entryId, input }: { entryId: string; input: UpdatePayrollEntryInput }) =>
      updatePayrollEntry(hotelId, entryId, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['hotels', hotelId, 'payroll', period] })
    },
  })
}

export function usePayPayrollEntry(hotelId: string, period: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (entryId: string) => payPayrollEntry(hotelId, entryId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['hotels', hotelId, 'payroll', period] })
    },
  })
}
