import { useEffect, useState } from "react";
import { PlusCircle, ListChecks, Trash2, Edit, ChevronDown, ChevronUp } from "lucide-react";
import { apiClient } from "@/shared/api/apiClient";
import { useNavigate } from "react-router-dom";

export interface Option {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface Question {
  id: string;
  text: string;
  timeLimit: number;
  maxPoints: number;
  options: Option[];
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  category: { name: string };
  questions: Question[];
}

export function DashboardPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedQuizIds, setExpandedQuizIds] = useState<Set<string>>(new Set());
  const navigate = useNavigate();

  const fetchQuizzes = () => {
    setIsLoading(true);
    apiClient.get('/quizzes')
      .then(res => setQuizzes(res.data))
      .catch(err => console.error("Error al cargar quizzes", err))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`¿Estás seguro de que deseas eliminar permanentemente el cuestionario "${title}" y todas sus preguntas?`)) {
      return;
    }
    
    try {
      await apiClient.delete(`/quizzes/${id}`);
      setQuizzes(prev => prev.filter(q => q.id !== id));
      alert("Cuestionario eliminado exitosamente.");
    } catch (error) {
      console.error(error);
      alert("Error al eliminar el cuestionario.");
    }
  };

  const toggleQuizExpansion = (id: string) => {
    setExpandedQuizIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Agrupar quizzes por categoría
  const groupedQuizzes = quizzes.reduce((acc: Record<string, Quiz[]>, quiz) => {
    const catName = quiz.category?.name || "Sin Categoría";
    if (!acc[catName]) acc[catName] = [];
    acc[catName].push(quiz);
    return acc;
  }, {});

  return (
    <main className="flex-grow flex flex-col items-center p-8 z-10 w-full animate-in fade-in duration-300">
      <div className="w-full max-w-5xl flex flex-col gap-8">
        
        <header className="flex justify-between items-end border-b-4 border-dashed border-[var(--color-ink)] pb-6">
          <div>
            <h1 className="font-headline text-5xl font-black tracking-tight uppercase">Dashboard</h1>
            <p className="font-body text-xl font-bold text-gray-600 mt-2">Gestiona tus cuestionarios y preguntas.</p>
          </div>
          
          <button 
            onClick={() => navigate('/quizzes/new')}
            className="flex items-center gap-2 bg-[var(--color-high-pink)] border-4 border-[var(--color-ink)] px-6 py-4 rounded-xl font-headline font-bold text-xl hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_var(--color-ink)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all">
            <PlusCircle size={24} />
            Crear Nuevo Quiz
          </button>
        </header>

        {isLoading ? (
          <div className="p-8 text-center font-bold text-xl animate-pulse">Cargando base de datos...</div>
        ) : quizzes.length === 0 ? (
          <div className="bg-white border-4 border-dashed border-[var(--color-ink)] p-12 rounded-2xl text-center">
            <p className="font-headline text-2xl font-bold mb-4">Aún no has creado ningún cuestionario.</p>
            <button onClick={() => navigate('/quizzes/new')} className="bg-[var(--color-ink)] text-white px-6 py-3 rounded-xl font-bold hover:bg-[var(--color-ink-offset)]">¡Crea el primero!</button>
          </div>
        ) : (
          <div className="flex flex-col gap-10">
            {Object.entries(groupedQuizzes).map(([categoryName, catQuizzes]) => (
              <section key={categoryName} className="flex flex-col gap-4">
                <h2 className="font-headline text-3xl font-black bg-[var(--color-paper-dim)] border-4 border-[var(--color-ink)] p-4 rounded-xl shadow-[4px_4px_0px_0px_var(--color-ink)]">
                  {categoryName}
                </h2>
                
                <div className="grid grid-cols-1 gap-6">
                  {catQuizzes.map(quiz => {
                    const isExpanded = expandedQuizIds.has(quiz.id);
                    return (
                      <div key={quiz.id} className="bg-white border-4 border-[var(--color-ink)] rounded-2xl shadow-[6px_6px_0px_0px_var(--color-ink)] transition-all overflow-hidden">
                        
                        {/* Cabecera del Quiz */}
                        <div className="p-6 flex justify-between items-center bg-white">
                          <div className="flex-grow cursor-pointer" onClick={() => toggleQuizExpansion(quiz.id)}>
                            <h3 className="font-headline text-2xl font-bold hover:underline decoration-4 underline-offset-4 decoration-[var(--color-high-yellow)]">{quiz.title}</h3>
                            <p className="text-gray-600 font-body mb-2">{quiz.description}</p>
                            <span className="bg-[var(--color-high-yellow)] border-2 border-[var(--color-ink)] px-3 py-1 rounded-lg text-sm font-bold flex items-center w-max gap-2">
                              <ListChecks size={16} /> {quiz.questions?.length || 0} Preguntas
                            </span>
                          </div>
                          
                          <div className="flex gap-2 items-center ml-4">
                            <button 
                              onClick={() => navigate(`/quizzes/edit/${quiz.id}`)}
                              className="bg-[#E0E7FF] border-2 border-[var(--color-ink)] p-3 rounded-xl hover:bg-indigo-200 transition-colors" title="Editar Quiz">
                              <Edit size={24} />
                            </button>
                            <button 
                              onClick={() => handleDelete(quiz.id, quiz.title)}
                              className="bg-red-200 border-2 border-[var(--color-ink)] p-3 rounded-xl hover:bg-red-300 transition-colors text-red-800" title="Eliminar Quiz">
                              <Trash2 size={24} />
                            </button>
                            <button 
                              onClick={() => toggleQuizExpansion(quiz.id)}
                              className="bg-gray-100 border-2 border-[var(--color-ink)] p-3 rounded-xl hover:bg-gray-200 transition-colors" title="Ver Preguntas">
                              {isExpanded ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                            </button>
                          </div>
                        </div>

                        {/* Acordeón de Preguntas */}
                        {isExpanded && (
                          <div className="border-t-4 border-dashed border-[var(--color-ink)] bg-gray-50 p-6 flex flex-col gap-4 animate-in slide-in-from-top-4 duration-300">
                            {quiz.questions && quiz.questions.length > 0 ? (
                              quiz.questions.map((q, i) => (
                                <div key={q.id} className="bg-white border-2 border-[var(--color-ink)] p-4 rounded-xl">
                                  <div className="flex justify-between items-start mb-2">
                                    <p className="font-bold text-lg"><span className="mr-2 text-gray-400">#{i + 1}</span> {q.text}</p>
                                    <div className="text-xs font-bold bg-gray-200 px-2 py-1 rounded">
                                      {q.timeLimit}s | {q.maxPoints}pts
                                    </div>
                                  </div>
                                  <ul className="grid grid-cols-2 gap-2 mt-3">
                                    {q.options.map((opt) => (
                                      <li key={opt.id} className={`p-2 rounded-lg border-2 text-sm font-bold flex items-center gap-2 ${opt.isCorrect ? 'bg-green-100 border-green-600' : 'bg-gray-100 border-gray-300 text-gray-500'}`}>
                                        <div className={`w-3 h-3 rounded-full border-2 border-black ${opt.isCorrect ? 'bg-green-500' : 'bg-white'}`}></div>
                                        {opt.text}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              ))
                            ) : (
                              <p className="italic text-gray-500 text-center py-4">No hay preguntas registradas en este cuestionario.</p>
                            )}
                          </div>
                        )}
                        
                      </div>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        )}

      </div>
    </main>
  );
}
