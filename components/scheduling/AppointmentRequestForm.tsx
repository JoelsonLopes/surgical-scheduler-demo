'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import * as React from 'react'
import { useForm } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { MaskedInput } from '@/components/ui/masked-input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  appointmentRequestSchema,
  AppointmentRequestValues,
} from '@/lib/validations/schedules'
import { DocumentUpload } from './DocumentUpload'

interface AppointmentRequestFormProps {
  onSubmit: (values: AppointmentRequestValues, documents?: File[]) => void
  onCancel: () => void
  isLoading: boolean
  initialData?: Partial<AppointmentRequestValues>
  mode?: 'create' | 'edit'
  onDelete?: () => void
  canDelete?: boolean
}

const insuranceOptions = [
  { value: 'BRADESCO_SAUDE', label: 'Bradesco Saúde' },
  { value: 'MEDSENIOR', label: 'MedSênior' },
  { value: 'CABERGS_SAUDE', label: 'Cabergs Saúde' },
  { value: 'POSTAL_SAUDE', label: 'Postal Saúde' },
  { value: 'UNIMED', label: 'Unimed' },
  { value: 'DANAMED', label: 'Danamed' },
  { value: 'SUL_AMERICA', label: 'Sul América' },
]

export function AppointmentRequestForm({
  onSubmit,
  onCancel,
  isLoading,
  initialData,
  mode = 'create',
  onDelete,
  canDelete = false,
}: AppointmentRequestFormProps) {
  const [documents, setDocuments] = React.useState<File[]>([])

  const form = useForm<AppointmentRequestValues>({
    resolver: zodResolver(appointmentRequestSchema),
    defaultValues: initialData || {
      patientName: '',
      birthDate: '',
      procedure: '',
      specialNeeds: '',
      patientPhone: '',
      estimatedEndTime: '',
    },
  })

  // Update form when initialData changes
  React.useEffect(() => {
    if (initialData) {
      form.reset(initialData)
    }
  }, [initialData, form])

  const handleSubmit = (values: AppointmentRequestValues) => {
    onSubmit(values, documents)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="patientName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome do Paciente</FormLabel>
                <FormControl>
                  <Input placeholder="Nome completo do paciente" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="birthDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data de Nascimento</FormLabel>
                <FormControl>
                  <MaskedInput
                    mask="__/__/____"
                    replacement={{ _: /\d/ }}
                    placeholder="DD/MM/AAAA"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="procedure"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Procedimento</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Descreva o procedimento a ser realizado"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="specialNeeds"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Necessidades Especiais</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Ex: Anestesista, equipamento X, etc."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="patientPhone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Telefone do Paciente</FormLabel>
                <FormControl>
                  <MaskedInput
                    mask="(__) _____-____"
                    replacement={{ _: /\d/ }}
                    placeholder="(XX) XXXXX-XXXX"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="insurance"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Convênio</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o convênio" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {insuranceOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="estimatedEndTime"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Horário de Término Estimado</FormLabel>
              <FormControl>
                <Input
                  type="time"
                  placeholder="HH:MM"
                  {...field}
                  className="max-w-[200px]"
                />
              </FormControl>
              <FormMessage />
              <p className="text-sm text-muted-foreground">
                Informe até que horas o procedimento deve durar para bloquear os
                slots necessários
              </p>
            </FormItem>
          )}
        />

        <DocumentUpload files={documents} onFilesChange={setDocuments} />

        <div className="flex justify-between gap-4 pt-6">
          <div>
            {mode === 'edit' && canDelete && onDelete && (
              <Button
                type="button"
                variant="destructive"
                onClick={onDelete}
                disabled={isLoading}
              >
                Excluir Agendamento
              </Button>
            )}
          </div>
          <div className="flex gap-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading
                ? mode === 'edit'
                  ? 'Salvando...'
                  : 'Enviando...'
                : mode === 'edit'
                  ? 'Salvar Alterações'
                  : 'Enviar Solicitação'}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  )
}
