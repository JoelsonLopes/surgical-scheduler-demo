import { z } from 'zod'

const phoneRegex = /^\(\d{2}\) \d{5}-\d{4}$/

export const appointmentRequestSchema = z.object({
  patientName: z
    .string()
    .min(3, { message: 'O nome do paciente é obrigatório.' }),
  birthDate: z
    .string()
    .min(10, { message: 'A data de nascimento é obrigatória.' }),
  procedure: z.string().min(5, { message: 'O procedimento é obrigatório.' }),
  specialNeeds: z
    .string()
    .min(1, { message: "Descreva as necessidades ou digite 'Nenhuma'." }),
  patientPhone: z.string().regex(phoneRegex, {
    message: 'Formato de telefone inválido. Use (XX) XXXXX-XXXX.',
  }),
  insurance: z.enum(
    [
      'BRADESCO_SAUDE',
      'MEDSENIOR',
      'CABERGS_SAUDE',
      'POSTAL_SAUDE',
      'UNIMED',
      'DANAMED',
      'SUL_AMERICA',
    ],
    { required_error: 'Selecione um convênio.' }
  ),
  estimatedEndTime: z
    .string()
    .min(1, { message: 'O horário de término é obrigatório.' })
    .regex(/^\d{2}:\d{2}$/, {
      message: 'Formato de horário inválido. Use HH:MM.',
    }),
  documents: z.any().optional(),
})

export type AppointmentRequestValues = z.infer<typeof appointmentRequestSchema>
