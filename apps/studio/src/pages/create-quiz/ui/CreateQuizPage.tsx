import { useEffect, useState } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { Save, Plus, Trash2, ArrowLeft } from "lucide-react";
import { apiClient } from "@/shared/api/apiClient";

interface Category {
  id: string;
  name: string;
}

interface QuizFormValues {
  title: string;
  description: string;
  categoryId: string;
  questions: {
    text: string;
    timeLimit: number;
    maxPoints: number;
    options: { text: string; isCorrect: boolean }[];
  }[];
}

export function CreateQuizPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(isEditMode);

  const { register, control, handleSubmit, reset, setValue } = useForm<QuizFormValues>({
    defaultValues: {
      title: "",
      description: "",
      categoryId: "",
      questions: [
        {
          text: "",
          timeLimit: 20,
          maxPoints: 100,
          options: [
            { text: "", isCorrect: true },
            { text: "", isCorrect: false },
          ],
        },
      ],
    },
  });

  useEffect(() => {
    // Cargar categorías
    apiClient.get<Category[]>("/quizzes/categories")
      .then((res) => setCategories(res.data))
      .catch((err) => console.error("Error fetching categories:", err));

    // Si es modo edición, cargar datos del Quiz
    if (isEditMode) {
      apiClient.get(`/quizzes/${id}`)
        .then(res => {
          const quiz = res.data;
          reset({
            title: quiz.title,
            description: quiz.description,
            categoryId: quiz.categoryId,
            questions: quiz.questions || []
          });
        })
        .catch(err => {
          console.error("Error fetching quiz:", err);
          alert("Error al cargar el cuestionario para editar.");
        })
        .finally(() => setIsLoading(false));
    }
  }, [id, isEditMode, reset]);

  const { fields: questionFields, append: appendQuestion, remove: removeQuestion } = useFieldArray({
    control,
    name: "questions",
  });

  const onSubmit = async (data: QuizFormValues) => {
    setIsSubmitting(true);
    try {
      const payload = { ...data };
      if (isEditMode) {
        await apiClient.put(`/quizzes/${id}`, payload);
        alert("¡Quiz actualizado exitosamente!");
      } else {
        await apiClient.post("/quizzes", payload);
        alert("¡Quiz creado exitosamente!");
      }
      navigate("/");
    } catch (error) {
      console.error(error);
      alert(`Error al ${isEditMode ? 'actualizar' : 'crear'} el Quiz`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <main className="flex-grow flex items-center justify-center font-bold text-xl">Cargando cuestionario...</main>;
  }

  return (
    <main className="flex-grow flex flex-col items-center p-8 z-10 w-full animate-in fade-in duration-300">
      <div className="w-full max-w-5xl flex flex-col gap-6">
        
        <header className="flex justify-between items-center border-b-4 border-dashed border-[var(--color-ink)] pb-4">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="p-2 border-2 border-[var(--color-ink)] rounded-xl hover:bg-[var(--color-paper-dim)]">
              <ArrowLeft size={24} />
            </button>
            <h1 className="font-headline text-4xl font-black uppercase">{isEditMode ? "Editar Quiz" : "Crear Nuevo Quiz"}</h1>
          </div>
          <button 
            onClick={handleSubmit(onSubmit)}
            disabled={isSubmitting}
            className="flex items-center gap-2 bg-[var(--color-high-pink)] border-4 border-[var(--color-ink)] px-6 py-3 rounded-xl font-headline font-bold text-xl hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_var(--color-ink)] transition-all disabled:opacity-50"
          >
            <Save size={24} />
            {isSubmitting ? "Guardando..." : "Guardar Quiz"}
          </button>
        </header>

        <form className="flex flex-col gap-8">
          {/* SECCIÓN: METADATA */}
          <section className="bg-white border-4 border-[var(--color-ink)] rounded-2xl p-6 shadow-[8px_8px_0px_0px_var(--color-ink)] flex flex-col gap-4">
            <h2 className="font-headline text-2xl font-bold border-b-2 border-[var(--color-ink)] pb-2 mb-2">1. Detalles Básicos</h2>
            
            <div className="flex flex-col gap-2">
              <label className="font-bold">Título del Cuestionario</label>
              <input {...register("title")} required className="border-2 border-[var(--color-ink)] p-3 rounded-xl focus:outline-none focus:ring-4 ring-[var(--color-high-yellow)] font-body text-lg" placeholder="Ej: Historia de la Informática" />
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-bold">Descripción Corta</label>
              <input {...register("description")} required className="border-2 border-[var(--color-ink)] p-3 rounded-xl focus:outline-none focus:ring-4 ring-[var(--color-high-yellow)] font-body text-lg" placeholder="Ej: Pon a prueba lo que sabes sobre el hardware retro" />
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-bold">Categoría</label>
              <select {...register("categoryId")} required className="border-2 border-[var(--color-ink)] p-3 rounded-xl focus:outline-none focus:ring-4 ring-[var(--color-high-yellow)] font-body text-lg bg-white">
                <option value="">Selecciona una categoría...</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </section>

          {/* SECCIÓN: PREGUNTAS */}
          <section className="flex flex-col gap-6">
            <div className="flex justify-between items-end">
              <h2 className="font-headline text-3xl font-bold uppercase">2. Preguntas</h2>
              <button 
                type="button" 
                onClick={() => appendQuestion({ text: "", timeLimit: 20, maxPoints: 100, options: [{ text: "", isCorrect: true }, { text: "", isCorrect: false }] })}
                className="flex items-center gap-2 bg-white border-2 border-[var(--color-ink)] px-4 py-2 rounded-xl font-bold hover:bg-[var(--color-high-yellow)] transition-all"
              >
                <Plus size={20} /> Añadir Pregunta
              </button>
            </div>

            {questionFields.map((qField, qIndex) => (
              <QuestionBlock 
                key={qField.id} 
                qIndex={qIndex} 
                control={control} 
                register={register} 
                setValue={setValue}
                removeQuestion={() => removeQuestion(qIndex)} 
              />
            ))}
          </section>
        </form>

      </div>
    </main>
  );
}

interface QuestionBlockProps {
  qIndex: number;
  control: any;
  register: any;
  setValue: any;
  removeQuestion: () => void;
}

// Subcomponente aislado para la Pregunta (Para poder usar useFieldArray anidado de opciones)
function QuestionBlock({ qIndex, control, register, setValue, removeQuestion }: QuestionBlockProps) {
  const { fields: optionFields, append: appendOption, remove: removeOption } = useFieldArray({
    control,
    name: `questions.${qIndex}.options`,
  });

  return (
    <div className="bg-[var(--color-paper-dim)] border-4 border-[var(--color-ink)] rounded-2xl p-6 shadow-[6px_6px_0px_0px_var(--color-ink)] flex flex-col gap-4 relative">
      
      <button type="button" onClick={removeQuestion} className="absolute top-4 right-4 text-red-600 hover:text-red-800 bg-white border-2 border-red-600 p-2 rounded-lg">
        <Trash2 size={20} />
      </button>

      <div className="flex items-center gap-4 mb-2 pr-12">
        <span className="bg-[var(--color-ink)] text-white font-headline text-xl font-bold h-10 w-10 flex items-center justify-center rounded-lg">{qIndex + 1}</span>
        <input 
          {...register(`questions.${qIndex}.text`)} 
          required 
          className="flex-grow border-2 border-[var(--color-ink)] p-3 rounded-xl focus:outline-none focus:ring-4 ring-[var(--color-high-yellow)] font-body text-xl font-bold" 
          placeholder="Escribe la pregunta aquí..." 
        />
      </div>

      <div className="flex gap-4 mb-4">
        <div className="flex flex-col gap-1 w-1/3">
          <label className="text-sm font-bold">Tiempo Límite (segs)</label>
          <input type="number" {...register(`questions.${qIndex}.timeLimit`, { valueAsNumber: true })} className="border-2 border-[var(--color-ink)] p-2 rounded-lg" />
        </div>
        <div className="flex flex-col gap-1 w-1/3">
          <label className="text-sm font-bold">Puntos Base</label>
          <input type="number" {...register(`questions.${qIndex}.maxPoints`, { valueAsNumber: true })} className="border-2 border-[var(--color-ink)] p-2 rounded-lg" />
        </div>
      </div>

      {/* OPCIONES DE RESPUESTA */}
      <div className="bg-white border-2 border-[var(--color-ink)] rounded-xl p-4 flex flex-col gap-3">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-bold">Opciones de Respuesta</h3>
          {optionFields.length < 4 && (
             <button 
              type="button" 
              onClick={() => appendOption({ text: "", isCorrect: false })}
              className="text-sm font-bold flex items-center gap-1 hover:underline"
             >
               <Plus size={16} /> Agregar Opción
             </button>
          )}
        </div>
        
        {optionFields.map((oField, oIndex) => (
          <div key={oField.id} className="flex items-center gap-3">
            <Controller
              control={control}
              name={`questions.${qIndex}.options.${oIndex}.isCorrect`}
              render={({ field }) => (
                <input 
                  type="radio" 
                  checked={field.value}
                  onChange={() => {
                    // Establecer TODAS las opciones de esta pregunta explícitamente a false, y solo la clickeada a true
                    optionFields.forEach((_, idx) => {
                      setValue(`questions.${qIndex}.options.${idx}.isCorrect`, idx === oIndex, {
                        shouldValidate: true,
                        shouldDirty: true,
                      });
                    });
                  }}
                  className="w-6 h-6 accent-[var(--color-ink)] cursor-pointer"
                  title="Marcar como respuesta correcta"
                  name={`correct-option-${qIndex}`} 
                />
              )}
            />
            <input 
              {...register(`questions.${qIndex}.options.${oIndex}.text`)} 
              required
              className={`flex-grow border-2 p-2 rounded-lg focus:outline-none ${oIndex === 0 ? 'border-green-600' : 'border-[var(--color-ink)]'}`} 
              placeholder={`Opción ${oIndex + 1}`} 
            />
            {optionFields.length > 2 && (
              <button type="button" onClick={() => removeOption(oIndex)} className="text-red-500 hover:text-red-700">
                <Trash2 size={18} />
              </button>
            )}
          </div>
        ))}
        <p className="text-xs text-gray-500 italic mt-2">Nota: Selecciona el círculo de la respuesta correcta.</p>
      </div>

    </div>
  );
}
