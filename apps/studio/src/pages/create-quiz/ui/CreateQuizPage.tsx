import { useEffect, useState } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { Save, Plus, Trash2, ArrowLeft, Sparkles, Bot, X, BookOpen } from "lucide-react";
import { apiClient } from "@/shared/api/apiClient";
import { useAlertStore } from "@/shared/store/useAlertStore";
import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

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
  const [showAiModal, setShowAiModal] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [notesText, setNotesText] = useState("");
  const [aiModel, setAiModel] = useState("gemini-flash-latest");
  const [availableModels, setAvailableModels] = useState<{id: string, name: string}[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExtractingPdf, setIsExtractingPdf] = useState(false);

  const { register, control, handleSubmit, reset, setValue, getValues, watch, formState: { isDirty } } = useForm<QuizFormValues>({
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

  const watchTitle = watch("title");
  const watchDescription = watch("description");
  const watchCategoryId = watch("categoryId");
  const isAiReady = Boolean(watchTitle?.trim() && watchDescription?.trim() && watchCategoryId);

  // Advertir al usuario si intenta cerrar o recargar la página con cambios sin guardar
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = ''; // Requerido por navegadores modernos para mostrar el prompt
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  const { showAlert } = useAlertStore();
  useEffect(() => {
    // Cargar categorías
    apiClient.get<Category[]>("/quizzes/categories")
      .then((res) => setCategories(res.data))
      .catch((err) => console.error("Error fetching categories:", err));
  }, []);

  useEffect(() => {
    // Si es modo edición, cargar datos del Quiz
    if (isEditMode && id) {
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
          showAlert("Error al cargar el cuestionario para editar.", "Error");
        })
        .finally(() => setIsLoading(false));
    }
  }, [id, isEditMode, reset]);

  useEffect(() => {
    if (availableModels.length === 0) {
      apiClient.get("/quizzes/models")
        .then(res => {
          if (!res.data.error) {
            setAvailableModels(res.data);
            // Si el modelo actual no está en la lista y hay modelos, seleccionar el primero
            if (res.data.length > 0 && !res.data.find((m: any) => m.id === aiModel)) {
              setAiModel(res.data[0].id);
            }
          }
        })
        .catch(console.error);
    }
  }, [availableModels.length, aiModel]);

  const { fields: questionFields, append: appendQuestion, remove: removeQuestion } = useFieldArray({
    control,
    name: "questions",
  });

  const handleGenerateAI = async () => {
    const { title, description, categoryId } = getValues();
    
    if (!title.trim() || !description.trim() || !categoryId) {
      showAlert("Debes llenar el Título, Descripción y Categoría en los Detalles Básicos antes de generar.", "Atención");
      return;
    }

    const category = categories.find(c => c.id === categoryId);
    
    setIsGenerating(true);
    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        categoryName: category?.name || "General",
        model: aiModel
      };
      
      const res = await apiClient.post("/quizzes/generate", payload);
      if (res.data.error) {
        showAlert(res.data.message || "No se pudieron generar las preguntas.", "Error");
      } else {
        const generatedQuestions = res.data;
        // Limpiamos las preguntas vacías actuales si no hemos escrito nada en ellas
        if (questionFields.length === 1 && !questionFields[0].text) {
          removeQuestion(0);
        }
        appendQuestion(generatedQuestions, { shouldFocus: false });
        setShowAiModal(false);
        showAlert("¡10 Preguntas generadas y añadidas con éxito!", "Éxito");
      }
    } catch (err: any) {
      console.error(err);
      const backendMessage = err.response?.data?.message;
      showAlert(backendMessage || "Error al conectar con la IA. Asegúrate de tener configurada la API KEY.", "Error");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showAlert("El archivo es demasiado grande. El límite es de 5MB.", "Atención");
      return;
    }

    setIsExtractingPdf(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      // pdfjs-dist expects { data: Uint8Array }
      const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
      const numPages = pdf.numPages;
      const limit = Math.min(numPages, 20);
      let fullText = "";

      for (let i = 1; i <= limit; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item: any) => item.str).join(" ");
        fullText += pageText + " ";
      }

      if (numPages > 20) {
        showAlert(`El PDF tiene ${numPages} páginas. Por seguridad, solo se extrajeron las primeras 20 páginas.`, "Atención");
      } else {
        showAlert("¡Texto extraído con éxito!", "Éxito");
      }

      const optimizedText = fullText.replace(/\s+/g, ' ').trim();
      setNotesText(optimizedText);
    } catch (error) {
      console.error("Error leyendo PDF:", error);
      showAlert("Hubo un error al procesar el PDF.", "Error");
    } finally {
      setIsExtractingPdf(false);
      // Reset input
      e.target.value = '';
    }
  };

  const handleGenerateFromNotes = async () => {
    if (!notesText.trim() || notesText.length < 50) {
      showAlert("Por favor, pega un texto más largo (apuntes, artículo) para que la IA tenga contexto suficiente.", "Atención");
      return;
    }

    setIsGenerating(true);
    try {
      const payload = {
        textContext: notesText.trim(),
        categories: categories.map(c => ({ id: c.id, name: c.name })),
        model: aiModel
      };
      
      const res = await apiClient.post("/quizzes/generate-full", payload);
      if (res.data.error) {
        showAlert(res.data.message || "No se pudo extraer el quiz del texto.", "Error");
      } else {
        const data = res.data;
        setValue("title", data.title);
        setValue("description", data.description);
        if (data.categoryId) setValue("categoryId", data.categoryId);
        
        // Limpiamos las preguntas actuales
        for (let i = questionFields.length - 1; i >= 0; i--) {
          removeQuestion(i);
        }
        appendQuestion(data.questions, { shouldFocus: false });
        
        setShowNotesModal(false);
        setNotesText("");
        showAlert("¡El Quiz completo fue generado mágicamente desde tus apuntes!", "Éxito");
      }
    } catch (err: any) {
      console.error(err);
      const backendMessage = err.response?.data?.message;
      showAlert(backendMessage || "Error al conectar con la IA. Asegúrate de tener configurada la API KEY.", "Error");
    } finally {
      setIsGenerating(false);
    }
  };

  const onSubmit = async (data: QuizFormValues) => {
    if (!data.title?.trim() || !data.description?.trim() || !data.categoryId) {
      showAlert("Por favor, completa todos los Detalles Básicos antes de guardar.", "Atención");
      return;
    }

    if (!data.questions || data.questions.length === 0) {
      showAlert("El cuestionario debe tener al menos una pregunta.", "Atención");
      return;
    }

    const invalidQuestion = data.questions.find(q => !q.text?.trim() || q.options.some(o => !o.text?.trim()));
    if (invalidQuestion) {
      showAlert("Asegúrate de que todas las preguntas y sus opciones tengan texto.", "Atención");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = { ...data };
      if (isEditMode) {
        await apiClient.put(`/quizzes/${id}`, payload);
        showAlert("¡Quiz actualizado exitosamente!", "Éxito");
      } else {
        await apiClient.post("/quizzes", payload);
        showAlert("¡Quiz creado exitosamente!", "Éxito");
      }
      navigate("/");
    } catch (error) {
      console.error(error);
      showAlert(`Error al ${isEditMode ? 'actualizar' : 'crear'} el Quiz`, "Error");
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
        
        <header className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 border-b-4 border-dashed border-[var(--color-ink)] pb-4">
          <div className="flex items-center gap-4">
            <button type="button" onClick={() => navigate(-1)} className="p-2 border-2 border-[var(--color-ink)] rounded-xl hover:bg-[var(--color-paper-dim)]">
              <ArrowLeft size={24} />
            </button>
            <h1 className="font-headline text-4xl font-black uppercase">{isEditMode ? "Editar Quiz" : "Crear Nuevo Quiz"}</h1>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            {!isEditMode && (
              <button 
                type="button"
                onClick={() => setShowNotesModal(true)}
                className="w-full sm:w-auto flex items-center gap-2 bg-purple-200 border-4 border-[var(--color-ink)] px-6 py-3 rounded-xl font-headline font-bold text-xl hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_var(--color-ink)] transition-all text-purple-900"
              >
                <BookOpen size={24} />
                Generar desde Apuntes
              </button>
            )}
            <button 
              type="button"
              onClick={handleSubmit(onSubmit)}
              disabled={isSubmitting}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[var(--color-high-pink)] border-4 border-[var(--color-ink)] px-6 py-3 rounded-xl font-headline font-bold text-xl hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_var(--color-ink)] transition-all disabled:opacity-50"
            >
              <Save size={24} />
              {isSubmitting ? "Guardando..." : "Guardar Quiz"}
            </button>
          </div>
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
            <div className="flex justify-between items-end border-b-2 border-[var(--color-ink)] pb-2">
              <h2 className="font-headline text-3xl font-bold uppercase">2. Preguntas</h2>
              <button 
                type="button" 
                onClick={() => setShowAiModal(true)}
                disabled={!isAiReady || isGenerating}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-headline font-bold text-lg border-2 border-[var(--color-ink)] transition-all ${isAiReady ? 'bg-[var(--color-high-blue)] hover:translate-y-[-2px] hover:shadow-[4px_4px_0px_0px_var(--color-ink)] text-[var(--color-ink)]' : 'bg-gray-200 text-gray-500 opacity-60 cursor-not-allowed'}`}
                title={!isAiReady ? "Llena los Detalles Básicos para activar la Inteligencia Artificial" : "Autocompletar 10 preguntas inteligentemente"}
              >
                <Sparkles size={20} /> 
                <span className="hidden sm:inline">Autocompletar con IA</span>
                <span className="sm:hidden">IA</span>
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

            <div className="flex flex-col sm:flex-row justify-center mt-4 gap-4">
              <button 
                type="button" 
                onClick={() => appendQuestion({ text: "", timeLimit: 20, maxPoints: 100, options: [{ text: "", isCorrect: true }, { text: "", isCorrect: false }] })}
                className="flex items-center justify-center w-full max-w-sm gap-2 bg-white border-4 border-[var(--color-ink)] px-6 py-4 rounded-2xl font-headline font-bold text-xl hover:bg-[var(--color-paper-dim)] hover:translate-y-[-2px] hover:shadow-[4px_4px_0px_0px_var(--color-ink)] transition-all"
              >
                <Plus size={24} /> Añadir Pregunta Manualmente
              </button>
            </div>
          </section>

          {/* BOTÓN FINAL DE GUARDAR */}
          <section className="flex justify-end pt-8 pb-12 border-t-4 border-dashed border-[var(--color-ink)]">
            <button 
              type="button"
              onClick={handleSubmit(onSubmit)}
              disabled={isSubmitting}
              className="flex items-center gap-2 bg-[var(--color-high-pink)] border-4 border-[var(--color-ink)] px-8 py-4 rounded-xl font-headline font-black text-2xl hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[8px_8px_0px_0px_var(--color-ink)] transition-all disabled:opacity-50 uppercase tracking-wide"
            >
              <Save size={28} />
              {isSubmitting ? "Guardando..." : "Terminar y Guardar Quiz"}
            </button>
          </section>
        </form>

        {/* MODAL MINIMALISTA DE IA */}
        {showAiModal && (
          <div className="fixed inset-0 bg-[var(--color-ink)]/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-white border-4 border-[var(--color-ink)] rounded-2xl w-full max-w-sm shadow-[12px_12px_0px_0px_var(--color-ink)] flex flex-col overflow-hidden">
              <header className="bg-[var(--color-high-blue)] border-b-4 border-[var(--color-ink)] p-4 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <Bot size={24} className="text-[var(--color-ink)]" />
                  <h2 className="font-headline font-black text-xl uppercase">Asistente IA</h2>
                </div>
                <button 
                  onClick={() => !isGenerating && setShowAiModal(false)}
                  className="hover:bg-white/50 p-1 rounded-lg transition-colors"
                  disabled={isGenerating}
                >
                  <X size={24} />
                </button>
              </header>
              <div className="p-6 flex flex-col gap-5 text-center">
                <p className="font-body text-md font-medium text-gray-800">
                  Se generarán <strong>10 preguntas</strong> basadas en: <br/>
                  <span className="bg-[var(--color-paper-dim)] px-2 py-1 rounded-md border border-[var(--color-ink)] inline-block mt-2 font-bold text-sm">
                    {watchTitle}
                  </span>
                </p>
                
                <div className="w-full flex flex-col gap-1 text-left">
                  <label className="font-bold text-xs text-gray-600 uppercase">Modelo a utilizar:</label>
                  <select 
                    value={aiModel} 
                    onChange={(e) => setAiModel(e.target.value)}
                    disabled={isGenerating || availableModels.length === 0}
                    className="border-2 border-[var(--color-ink)] p-2 rounded-xl font-body text-md focus:outline-none focus:ring-2 ring-[var(--color-high-yellow)] w-full bg-white cursor-pointer"
                  >
                    {availableModels.length > 0 ? (
                      availableModels.map(m => (
                        <option key={m.id} value={m.id}>
                          {m.name}
                        </option>
                      ))
                    ) : (
                      <option value="gemini-flash-latest">Cargando...</option>
                    )}
                  </select>
                </div>

                <button
                  onClick={handleGenerateAI}
                  disabled={isGenerating}
                  className="w-full mt-2 flex items-center justify-center gap-2 bg-[var(--color-high-yellow)] border-4 border-[var(--color-ink)] py-3 rounded-xl font-headline font-black text-lg hover:translate-y-[-2px] hover:shadow-[4px_4px_0px_0px_var(--color-ink)] transition-all disabled:opacity-50 disabled:translate-y-0 disabled:shadow-none"
                >
                  {isGenerating ? (
                    <span className="animate-pulse">Pensando...</span>
                  ) : (
                    <>
                      <Sparkles size={20} /> Generar
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
        {/* MODAL MINIMALISTA DE APUNTES */}
        {showNotesModal && (
          <div className="fixed inset-0 bg-[var(--color-ink)]/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-white border-4 border-[var(--color-ink)] rounded-2xl w-full max-w-2xl shadow-[12px_12px_0px_0px_var(--color-ink)] flex flex-col overflow-hidden max-h-[90vh]">
              <header className="bg-purple-200 border-b-4 border-[var(--color-ink)] p-4 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <BookOpen size={28} className="text-[var(--color-ink)]" />
                  <h2 className="font-headline font-black text-2xl uppercase">Generación desde Apuntes</h2>
                </div>
                <button 
                  onClick={() => !isGenerating && setShowNotesModal(false)}
                  className="hover:bg-white/50 p-1 rounded-lg transition-colors"
                  disabled={isGenerating}
                >
                  <X size={24} />
                </button>
              </header>
              <div className="p-6 flex flex-col gap-4 overflow-y-auto">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-purple-50 p-4 rounded-xl border-2 border-purple-200">
                  <p className="font-body text-md font-medium text-gray-800">
                    Pega tu texto, o sube un archivo <b>PDF</b> para extraer sus apuntes automáticamente (Max 5MB, 20 páginas).
                  </p>
                  <label className={`flex-shrink-0 flex items-center justify-center gap-2 border-2 border-[var(--color-ink)] px-4 py-2 rounded-xl font-headline font-bold cursor-pointer transition-all ${isGenerating || isExtractingPdf ? 'opacity-50 cursor-not-allowed bg-gray-200' : 'bg-white hover:bg-purple-100'}`}>
                    <BookOpen size={20} />
                    {isExtractingPdf ? 'Leyendo PDF...' : 'Subir PDF'}
                    <input type="file" accept="application/pdf" className="hidden" onChange={handleFileUpload} disabled={isGenerating || isExtractingPdf} />
                  </label>
                </div>

                <textarea
                  value={notesText}
                  onChange={(e) => setNotesText(e.target.value)}
                  disabled={isGenerating}
                  placeholder="Ejemplo: La Revolución Francesa fue un conflicto social y político... (mínimo 50 caracteres)"
                  className="w-full border-2 border-[var(--color-ink)] p-4 rounded-xl focus:outline-none focus:ring-4 ring-[var(--color-high-yellow)] font-body text-md resize-y min-h-[200px]"
                />
                
                <div className="w-full flex flex-col sm:flex-row gap-4 mt-2">
                  <div className="flex-1 flex flex-col gap-1">
                    <label className="font-bold text-xs text-gray-600 uppercase">Modelo a utilizar:</label>
                    <select 
                      value={aiModel} 
                      onChange={(e) => setAiModel(e.target.value)}
                      disabled={isGenerating || availableModels.length === 0}
                      className="border-2 border-[var(--color-ink)] p-2 rounded-xl font-body text-md focus:outline-none focus:ring-2 ring-[var(--color-high-yellow)] w-full bg-white cursor-pointer"
                    >
                      {availableModels.length > 0 ? (
                        availableModels.map(m => (
                          <option key={m.id} value={m.id}>
                            {m.name}
                          </option>
                        ))
                      ) : (
                        <option value="gemini-flash-latest">Cargando...</option>
                      )}
                    </select>
                  </div>

                  <button
                    onClick={handleGenerateFromNotes}
                    disabled={isGenerating || notesText.length < 50}
                    className="flex-1 flex items-center justify-center gap-2 bg-purple-300 border-4 border-[var(--color-ink)] py-3 rounded-xl font-headline font-black text-xl hover:translate-y-[-2px] hover:shadow-[4px_4px_0px_0px_var(--color-ink)] transition-all disabled:opacity-50 disabled:translate-y-0 disabled:shadow-none mt-auto"
                  >
                    {isGenerating ? (
                      <span className="animate-pulse">Procesando Texto...</span>
                    ) : (
                      <>
                        <Sparkles size={20} /> Generar Quiz Completo
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

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

  useEffect(() => {
    const el = document.getElementById(`textarea-q-${qIndex}`);
    if (el) {
      el.style.height = 'auto';
      el.style.height = `${el.scrollHeight}px`;
    }
  }, []);

  return (
    <div className="bg-[var(--color-paper-dim)] border-4 border-[var(--color-ink)] rounded-2xl p-6 shadow-[6px_6px_0px_0px_var(--color-ink)] flex flex-col gap-4 relative">
      
      <button type="button" onClick={removeQuestion} className="absolute top-4 right-4 text-red-600 hover:text-red-800 bg-white border-2 border-red-600 p-2 rounded-lg">
        <Trash2 size={20} />
      </button>

      <div className="flex items-start gap-4 mb-2 pr-12">
        <span className="bg-[var(--color-ink)] text-white font-headline text-xl font-bold h-10 w-10 flex items-center justify-center rounded-lg flex-shrink-0">{qIndex + 1}</span>
        <textarea 
          id={`textarea-q-${qIndex}`}
          {...register(`questions.${qIndex}.text`)} 
          required 
          rows={1}
          onInput={(e) => {
            const target = e.currentTarget;
            target.style.height = 'auto';
            target.style.height = `${target.scrollHeight}px`;
          }}
          className="flex-grow border-2 border-[var(--color-ink)] p-3 rounded-xl focus:outline-none focus:ring-4 ring-[var(--color-high-yellow)] font-body text-xl font-bold resize-none overflow-hidden min-h-[60px]" 
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
