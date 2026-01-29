'use client'

/**
 * QuestionRenderer Component
 * Renders different question types with appropriate input controls
 */

import { useState, useCallback } from 'react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { CheckCircle2, XCircle, GripVertical } from 'lucide-react'
import type { QuestionWithOptions, QuestionOption } from '@/lib/services/quiz-questions'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface QuestionRendererProps {
  question: QuestionWithOptions
  value: any
  onChange: (value: any) => void
  showCorrectAnswer?: boolean
  disabled?: boolean
}

export function QuestionRenderer({
  question,
  value,
  onChange,
  showCorrectAnswer = false,
  disabled = false,
}: QuestionRendererProps) {
  // Render question text
  const questionText = question.question_html || question.question_text

  switch (question.question_type) {
    case 'multiple_choice':
      return (
        <MultipleChoiceQuestion
          question={question}
          value={value}
          onChange={onChange}
          showCorrectAnswer={showCorrectAnswer}
          disabled={disabled}
        />
      )

    case 'multiple_response':
      return (
        <MultipleResponseQuestion
          question={question}
          value={value}
          onChange={onChange}
          showCorrectAnswer={showCorrectAnswer}
          disabled={disabled}
        />
      )

    case 'true_false':
      return (
        <TrueFalseQuestion
          question={question}
          value={value}
          onChange={onChange}
          showCorrectAnswer={showCorrectAnswer}
          disabled={disabled}
        />
      )

    case 'fill_blank':
      return (
        <FillBlankQuestion
          question={question}
          value={value}
          onChange={onChange}
          showCorrectAnswer={showCorrectAnswer}
          disabled={disabled}
        />
      )

    case 'drag_drop_order':
      return (
        <DragDropOrderQuestion
          question={question}
          value={value}
          onChange={onChange}
          showCorrectAnswer={showCorrectAnswer}
          disabled={disabled}
        />
      )

    case 'matching':
      return (
        <MatchingQuestion
          question={question}
          value={value}
          onChange={onChange}
          showCorrectAnswer={showCorrectAnswer}
          disabled={disabled}
        />
      )

    case 'calculation':
      return (
        <CalculationQuestion
          question={question}
          value={value}
          onChange={onChange}
          showCorrectAnswer={showCorrectAnswer}
          disabled={disabled}
        />
      )

    case 'essay':
    case 'case_study':
      return (
        <EssayQuestion
          question={question}
          value={value}
          onChange={onChange}
          showCorrectAnswer={showCorrectAnswer}
          disabled={disabled}
        />
      )

    default:
      return <div className="text-muted-foreground">Unsupported question type</div>
  }
}

// ============================================================================
// MULTIPLE CHOICE
// ============================================================================

function MultipleChoiceQuestion({
  question,
  value,
  onChange,
  showCorrectAnswer,
  disabled,
}: QuestionRendererProps) {
  const selectedId = value?.selected_option_id

  return (
    <div className="space-y-4">
      <p className="text-lg font-medium">{question.question_text}</p>
      <RadioGroup
        value={selectedId || ''}
        onValueChange={(optionId) => onChange({ selected_option_id: optionId })}
        disabled={disabled}
      >
        <div className="space-y-3">
          {question.options.map((option) => {
            const isSelected = option.id === selectedId
            const isCorrect = option.is_correct
            const showFeedback = showCorrectAnswer && isSelected

            return (
              <div
                key={option.id}
                className={`flex items-start space-x-3 rounded-lg border p-4 transition-colors ${
                  showCorrectAnswer
                    ? isCorrect
                      ? 'border-green-500 bg-green-50'
                      : isSelected
                        ? 'border-red-500 bg-red-50'
                        : 'border-gray-200'
                    : isSelected
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <RadioGroupItem value={option.id} id={option.id} className="mt-0.5" />
                <div className="flex-1">
                  <Label htmlFor={option.id} className="cursor-pointer">
                    <div className="flex items-center gap-2">
                      {showCorrectAnswer && isCorrect && (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      )}
                      {showCorrectAnswer && isSelected && !isCorrect && (
                        <XCircle className="h-5 w-5 text-red-600" />
                      )}
                      <span>{option.option_text}</span>
                    </div>
                  </Label>
                  {showFeedback && option.feedback && (
                    <p className="text-muted-foreground mt-2 text-sm">{option.feedback}</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </RadioGroup>
    </div>
  )
}

// ============================================================================
// MULTIPLE RESPONSE
// ============================================================================

function MultipleResponseQuestion({
  question,
  value,
  onChange,
  showCorrectAnswer,
  disabled,
}: QuestionRendererProps) {
  const selectedIds = value?.selected_option_ids || []

  const handleToggle = (optionId: string) => {
    const newSelected = selectedIds.includes(optionId)
      ? selectedIds.filter((id: string) => id !== optionId)
      : [...selectedIds, optionId]

    onChange({ selected_option_ids: newSelected })
  }

  return (
    <div className="space-y-4">
      <p className="text-lg font-medium">{question.question_text}</p>
      <p className="text-muted-foreground text-sm">Select all that apply</p>
      <div className="space-y-3">
        {question.options.map((option) => {
          const isSelected = selectedIds.includes(option.id)
          const isCorrect = option.is_correct

          return (
            <div
              key={option.id}
              className={`flex items-start space-x-3 rounded-lg border p-4 transition-colors ${
                showCorrectAnswer
                  ? isCorrect
                    ? 'border-green-500 bg-green-50'
                    : isSelected
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-200'
                  : isSelected
                    ? 'border-primary bg-primary/5'
                    : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Checkbox
                id={option.id}
                checked={isSelected}
                onCheckedChange={() => handleToggle(option.id)}
                disabled={disabled}
                className="mt-0.5"
              />
              <div className="flex-1">
                <Label htmlFor={option.id} className="cursor-pointer">
                  <div className="flex items-center gap-2">
                    {showCorrectAnswer && isCorrect && (
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    )}
                    {showCorrectAnswer && isSelected && !isCorrect && (
                      <XCircle className="h-5 w-5 text-red-600" />
                    )}
                    <span>{option.option_text}</span>
                  </div>
                </Label>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ============================================================================
// TRUE/FALSE
// ============================================================================

function TrueFalseQuestion({
  question,
  value,
  onChange,
  showCorrectAnswer,
  disabled,
}: QuestionRendererProps) {
  const trueOption = question.options.find((opt) => opt.option_text.toLowerCase() === 'true')
  const falseOption = question.options.find((opt) => opt.option_text.toLowerCase() === 'false')

  const selectedId = value?.selected_option_id

  return (
    <div className="space-y-4">
      <p className="text-lg font-medium">{question.question_text}</p>
      <RadioGroup
        value={selectedId || ''}
        onValueChange={(optionId) => onChange({ selected_option_id: optionId })}
        disabled={disabled}
      >
        <div className="grid grid-cols-2 gap-4">
          {trueOption && (
            <div
              className={`flex cursor-pointer items-center space-x-3 rounded-lg border p-6 transition-colors ${
                showCorrectAnswer
                  ? trueOption.is_correct
                    ? 'border-green-500 bg-green-50'
                    : selectedId === trueOption.id
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-200'
                  : selectedId === trueOption.id
                    ? 'border-primary bg-primary/5'
                    : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <RadioGroupItem value={trueOption.id} id={trueOption.id} />
              <Label htmlFor={trueOption.id} className="flex-1 cursor-pointer text-center">
                <span className="text-xl font-semibold">True</span>
              </Label>
            </div>
          )}
          {falseOption && (
            <div
              className={`flex cursor-pointer items-center space-x-3 rounded-lg border p-6 transition-colors ${
                showCorrectAnswer
                  ? falseOption.is_correct
                    ? 'border-green-500 bg-green-50'
                    : selectedId === falseOption.id
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-200'
                  : selectedId === falseOption.id
                    ? 'border-primary bg-primary/5'
                    : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <RadioGroupItem value={falseOption.id} id={falseOption.id} />
              <Label htmlFor={falseOption.id} className="flex-1 cursor-pointer text-center">
                <span className="text-xl font-semibold">False</span>
              </Label>
            </div>
          )}
        </div>
      </RadioGroup>
    </div>
  )
}

// ============================================================================
// FILL IN THE BLANK
// ============================================================================

function FillBlankQuestion({
  question,
  value,
  onChange,
  showCorrectAnswer,
  disabled,
}: QuestionRendererProps) {
  const textAnswer = value?.text_answer || ''

  return (
    <div className="space-y-4">
      <p className="text-lg font-medium">{question.question_text}</p>
      <Input
        type="text"
        value={textAnswer}
        onChange={(e) => onChange({ text_answer: e.target.value })}
        placeholder="Type your answer here..."
        disabled={disabled}
        className={
          showCorrectAnswer
            ? textAnswer.toLowerCase().trim() ===
              question.options[0]?.option_text.toLowerCase().trim()
              ? 'border-green-500'
              : 'border-red-500'
            : ''
        }
      />
      {showCorrectAnswer && (
        <div className="rounded border border-blue-200 bg-blue-50 p-3">
          <p className="text-sm text-blue-900">
            <strong>Correct answer:</strong> {question.options[0]?.option_text}
          </p>
        </div>
      )}
    </div>
  )
}

// ============================================================================
// DRAG AND DROP ORDERING
// ============================================================================

interface SortableItemProps {
  id: string
  text: string
  index: number
}

function SortableItem({ id, text, index }: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="hover:border-primary flex items-center gap-3 rounded-lg border bg-white p-4 transition-colors"
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab touch-none active:cursor-grabbing"
        aria-label="Drag to reorder"
      >
        <GripVertical className="text-muted-foreground h-5 w-5" />
      </button>
      <div className="flex flex-1 items-center gap-3">
        <span className="bg-primary/10 text-primary flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold">
          {index + 1}
        </span>
        <span>{text}</span>
      </div>
    </div>
  )
}

function DragDropOrderQuestion({
  question,
  value,
  onChange,
  showCorrectAnswer,
  disabled,
}: QuestionRendererProps) {
  const [items, setItems] = useState(
    value?.ordered_option_ids
      ? value.ordered_option_ids.map((id: string) => question.options.find((opt) => opt.id === id))
      : [...question.options]
  )

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      setItems((items: QuestionOption[]) => {
        const oldIndex = items.findIndex((item) => item?.id === active.id)
        const newIndex = items.findIndex((item) => item?.id === over.id)

        const newItems = arrayMove(items, oldIndex, newIndex)
        onChange({ ordered_option_ids: newItems.map((item) => item?.id) })
        return newItems
      })
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-lg font-medium">{question.question_text}</p>
      <p className="text-muted-foreground text-sm">Drag and drop to arrange in the correct order</p>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext
          items={items.map((item: QuestionOption) => item!.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {items.map((item: QuestionOption, index: number) => (
              <SortableItem key={item!.id} id={item!.id} text={item!.option_text} index={index} />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {showCorrectAnswer && (
        <div className="rounded border border-blue-200 bg-blue-50 p-3">
          <p className="mb-2 text-sm font-semibold text-blue-900">Correct order:</p>
          <ol className="list-inside list-decimal space-y-1 text-sm text-blue-900">
            {question.options
              .sort((a, b) => a.order_index - b.order_index)
              .map((option) => (
                <li key={option.id}>{option.option_text}</li>
              ))}
          </ol>
        </div>
      )}
    </div>
  )
}

// ============================================================================
// MATCHING
// ============================================================================

function MatchingQuestion({
  question,
  value,
  onChange,
  showCorrectAnswer,
  disabled,
}: QuestionRendererProps) {
  const pairs = value?.pairs || {}
  const leftItems = question.options.filter((_, index) => index % 2 === 0)
  const rightItems = question.options.filter((_, index) => index % 2 === 1)

  const handleMatch = (leftId: string, rightId: string) => {
    onChange({
      pairs: {
        ...pairs,
        [leftId]: rightId,
      },
    })
  }

  return (
    <div className="space-y-4">
      <p className="text-lg font-medium">{question.question_text}</p>
      <p className="text-muted-foreground text-sm">
        Match items from the left with items on the right
      </p>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          {leftItems.map((item) => (
            <Card key={item.id}>
              <CardContent className="p-4">
                <p className="font-medium">{item.option_text}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="space-y-2">
          {leftItems.map((leftItem) => (
            <select
              key={leftItem.id}
              value={pairs[leftItem.id] || ''}
              onChange={(e) => handleMatch(leftItem.id, e.target.value)}
              disabled={disabled}
              className="w-full rounded-lg border p-4"
              aria-label={`Match for ${leftItem.option_text}`}
            >
              <option value="">Select match...</option>
              {rightItems.map((rightItem) => (
                <option key={rightItem.id} value={rightItem.id}>
                  {rightItem.option_text}
                </option>
              ))}
            </select>
          ))}
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// CALCULATION
// ============================================================================

function CalculationQuestion({
  question,
  value,
  onChange,
  showCorrectAnswer,
  disabled,
}: QuestionRendererProps) {
  const numericAnswer = value?.numeric_answer || ''

  return (
    <div className="space-y-4">
      <p className="text-lg font-medium">{question.question_text}</p>
      <Input
        type="number"
        step="any"
        value={numericAnswer}
        onChange={(e) => onChange({ numeric_answer: e.target.value })}
        placeholder="Enter your numerical answer..."
        disabled={disabled}
      />
      {showCorrectAnswer && (
        <div className="rounded border border-blue-200 bg-blue-50 p-3">
          <p className="text-sm text-blue-900">
            <strong>Correct answer:</strong> {question.metadata.correct_answer}
          </p>
        </div>
      )}
    </div>
  )
}

// ============================================================================
// ESSAY / CASE STUDY
// ============================================================================

function EssayQuestion({
  question,
  value,
  onChange,
  showCorrectAnswer,
  disabled,
}: QuestionRendererProps) {
  const essayAnswer = value?.essay_answer || ''

  return (
    <div className="space-y-4">
      <p className="text-lg font-medium">{question.question_text}</p>
      {question.question_type === 'case_study' && question.metadata.case_text && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <p className="whitespace-pre-wrap text-sm">{question.metadata.case_text}</p>
          </CardContent>
        </Card>
      )}
      <Textarea
        value={essayAnswer}
        onChange={(e) => onChange({ essay_answer: e.target.value })}
        placeholder="Type your answer here..."
        rows={10}
        disabled={disabled}
        className="min-h-[200px]"
      />
      <p className="text-muted-foreground text-sm">
        This question requires manual grading by an instructor.
      </p>
    </div>
  )
}
