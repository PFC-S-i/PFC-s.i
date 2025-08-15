'use client'

import Image from 'next/image'
import { FieldValues, Path, UseFormReturn } from 'react-hook-form'

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { cn } from '@/lib/utils'

type Option = {
  value: string | number
  label: string
  image?: string
}

type FormFields<T extends FieldValues> = {
  name: Path<T>
  label: string
  options: Option[]
  disabled?: boolean
  optionClassName?: string
  optionClassNameRadio?: string
}

interface Props<T extends FieldValues> {
  form: UseFormReturn<T>
  fields: FormFields<T>
}

const FormRadioGroup = <T extends FieldValues>({ form, fields }: Props<T>) => {
  return (
    <Form {...form}>
      <div className="w-full space-y-6">
        <FormField
          control={form.control}
          name={fields.name}
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>{fields.label}</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={fields.disabled}
                  data-testid={`radiogroup-${fields.name}`}
                  className={cn('flex', fields.optionClassNameRadio)}
                >
                  {fields.options.map((item) => (
                    <FormItem
                      key={JSON.stringify(item)}
                      data-testid={`radio-item-${item.value}`}
                      className={cn(
                        'flex items-center space-x-3 space-y-0',
                        fields.optionClassName,
                      )}
                    >
                      <FormControl>
                        <RadioGroupItem value={item.value.toString()} />
                      </FormControl>
                      {item.image && (
                        <Image
                          src={item.image}
                          alt={item.label}
                          width={200}
                          height={200}
                        />
                      )}
                      <FormLabel className="font-normal">
                        {item.label}
                      </FormLabel>
                    </FormItem>
                  ))}
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </Form>
  )
}

export { FormRadioGroup }
