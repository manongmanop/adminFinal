import React, { useEffect, useMemo, useState } from "react";
import { Button, Input, Textarea, Badge, Card } from "../components/ui.jsx";
import {
  Plus,
  Search,
  Activity,
  Calendar,
  Target,
  Flame,
  Trash2,
  Edit2,
  Save,
  Upload,
  Dumbbell,
  Layers,
  CheckCircle2,
  Clock,
  Users
} from "lucide-react";
import "../css/Programs.css";
import { fetchPrograms, fetchExercises, createProgram, updateProgram, deleteProgram } from "../api/client.js";

const createEmptyProgram = () => ({
  id: `program-${Date.now()}`,
  name: "a¦éa+¢a+úa¦üa+üa+úa+ía¦âa+½a+ía¦ê",
  description: "a+¡a+ÿa+¦a+Üa+¦a+óa+úa+¦a+óa+Ña+¦a¦Ça+¡a+¦a+óa+öa¦éa+¢a+úa¦üa+üa+úa+í",
  duration: "",
  caloriesBurned: 0,
  image: "",
  category: "",
  workoutList: [],
});

const emptyWorkoutForm = () => ({
  id: null,
  name: "",
  description: "",
  musclesText: "",
  muscles: [],
  type: "reps",
  value: "",
  duration: "",
  image: "",
  video: "",
});

export default function Programs() {
  const [programs, setPrograms] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProgramId, setSelectedProgramId] = useState(null);
  const [programForm, setProgramForm] = useState(null);
  const [programErrors, setProgramErrors] = useState({});
  const [workoutForm, setWorkoutForm] = useState(emptyWorkoutForm());
  const [workoutErrors, setWorkoutErrors] = useState({});
  const [editingWorkoutId, setEditingWorkoutId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [allExercises, setAllExercises] = useState([]);
  const [exerciseQuery, setExerciseQuery] = useState("");
  const [selectedExerciseIds, setSelectedExerciseIds] = useState(new Set());
  const [dragIndex, setDragIndex] = useState(null);

  // Normalize image URLs: if it's a bare filename, serve from /uploads
  function resolveImageUrl(src) {
    if (!src) return '';
    if (typeof src !== 'string') return '';
    if (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('/')) return src;
    return `/uploads/${src}`;
  }

  function handleReorderWorkouts(fromIndex, toIndex) {
    if (fromIndex === null || toIndex === null || fromIndex === toIndex) return;
    if (!programForm) return;
    const list = [...(programForm.workoutList || [])];
    const [moved] = list.splice(fromIndex, 1);
    list.splice(toIndex, 0, moved);
    const updated = { ...programForm, workoutList: list };
    setProgramForm(updated);
    setPrograms((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    // Persist order immediately
    const isObjectId = (id) => typeof id === 'string' && /^[a-f0-9]{24}$/i.test(id);
    (async () => {
      try {
        setLoading(true);
        const saved = isObjectId(updated.id)
          ? await updateProgram(updated.id, updated)
          : await createProgram(updated);
        setProgramForm(saved);
        setPrograms((prev) => prev.map((p) => (p.id === saved.id ? saved : p)));
        setSelectedProgramId(saved.id);
        pushToast({ type: 'success', title: 'a+¡a+¦a+¢a¦Ça+öa+òa+Ña+¦a+öa+¦a+Üa+¬a+¦a¦Ça+úa¦ça+ê' });
      } catch (e) {
        console.error(e);
        pushToast({ type: 'error', title: 'a+¡a+¦a+¢a¦Ça+öa+òa+Ña+¦a+öa+¦a+Üa¦äa+ía¦êa+¬a+¦a¦Ça+úa¦ça+ê' });
      } finally {
        setLoading(false);
      }
    })();
  }

  // Toast helpers
  function pushToast({ type = 'info', title = '', message = '' }) {
    const id = `t-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const toast = { id, type, title, message };
    setToasts((prev) => [toast, ...prev]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3800);
  }
  const dismissToast = (id) => setToasts((prev) => prev.filter((t) => t.id !== id));

  async function openExercisePicker() {
    try {
      setPickerOpen(true);
      if (!allExercises.length) {
        const data = await fetchExercises();
        setAllExercises(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.error(e);
      pushToast({ type: 'error', title: 'a¦éa+½a+Ña+öa+ùa¦êa+¦a+¡a+¡a+üa+üa+¦a+Ña+¦a+ça+üa+¦a+óa¦äa+ía¦êa+¬a+¦a¦Ça+úa¦ça+ê' });
    }
  }

  function toggleSelectExercise(id) {
    setSelectedExerciseIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  async function addSelectedExercisesToProgram() {
    if (!selectedExerciseIds.size) {
      setPickerOpen(false);
      return;
    }
    let targetProgram = programForm;
    if (!targetProgram) {
      targetProgram = createEmptyProgram();
      targetProgram.workoutList = [];
      setProgramForm(targetProgram);
      setSelectedProgramId(targetProgram.id);
      setPrograms((prev) => [targetProgram, ...prev]);
    }

    const byId = new Map((targetProgram.workoutList || []).map((w) => [w.exerciseId || w.id, true]));
    const toAdd = allExercises
      .filter((ex) => selectedExerciseIds.has(ex.id) && !byId.has(ex.id))
      .map((ex) => ({
        id: `w-${Date.now()}-${Math.random().toString(36).slice(2,8)}`,
        exercise: ex.id,
        name: ex.name,
        description: ex.description,
        muscles: ex.muscles || [],
        type: ex.type === 'time' ? 'time' : 'reps',
        value: ex.type === 'reps' ? (ex.value ?? "") : "",
        duration: ex.type === 'time' ? (ex.duration ?? "") : "",
        image: ex.image,
        video: ex.video,
      }));

    const candidate = { ...targetProgram, workoutList: [...(targetProgram.workoutList || []), ...toAdd] };

    try {
      setLoading(true);
      const isObjectId = (id) => typeof id === 'string' && /^[a-f0-9]{24}$/i.test(id);
      let saved;
      if (!isObjectId(candidate.id)) {
        saved = await createProgram(candidate);
      } else {
        saved = await updateProgram(candidate.id, candidate);
      }

      // Sync UI with saved program
      setProgramForm(saved);
      setPrograms((prev) => {
        const exists = prev.find((p) => p.id === saved.id);
        if (exists) return prev.map((p) => (p.id === saved.id ? saved : p));
        return [saved, ...prev.filter((p) => p.id !== candidate.id)];
      });
      setSelectedProgramId(saved.id);

      const addedCount = toAdd.length;
      pushToast({ type: 'success', title: 'a¦Ça+Pa+¦a¦êa+ía+ùa¦êa+¦a+¬a+¦a¦Ça+úa¦ça+ê', message: `a¦Ça+Pa+¦a¦êa+ía+ùa¦êa+¦a+¡a+¡a+üa+üa+¦a+Ña+¦a+ça+üa+¦a+ó ${addedCount} a+úa+¦a+óa+üa+¦a+ú a¦üa+Ña+¦a+Üa+¦a+Öa+ùa+¦a+üa¦üa+Ña¦ëa+º` });
    } catch (e) {
      console.error(e);
      pushToast({ type: 'error', title: 'a¦Ça+üa+¦a+öa+éa¦ëa+¡a+£a+¦a+öa+Pa+Ña+¦a+ö', message: 'a¦äa+ía¦êa+¬a+¦a+ía+¦a+úa+ûa¦Ça+Pa+¦a¦êa+ía¦üa+Ña+¦a+Üa+¦a+Öa+ùa+¦a+üa+ùa¦êa+¦a¦äa+öa¦ë' });
    } finally {
      setSelectedExerciseIds(new Set());
      setExerciseQuery("");
      setPickerOpen(false);
      setLoading(false);
    }
  }

  // ---- API-backed CRUD helpers ----
  const looksLikeObjectId = (id) => typeof id === 'string' && /^[a-f0-9]{24}$/i.test(id);

  async function saveProgram() {
    if (!programForm) return;
    const errors = {};
    if (!programForm.name || programForm.name.trim() === "") {
      errors.name = "a¦éa+¢a+úa+öa+üa+úa+¡a+üa+èa++a¦êa+¡a¦éa+¢a+úa¦üa+üa+úa+í";
    }
    if (Object.keys(errors).length) {
      setProgramErrors(errors);
      return;
    }
    try {
      setLoading(true);
      let saved;
      if (!looksLikeObjectId(programForm.id)) {
        saved = await createProgram(programForm);
      } else {
        saved = await updateProgram(programForm.id, programForm);
      }
      setPrograms((prev) => {
        const exists = prev.find((p) => p.id === saved.id);
        if (exists) return prev.map((p) => (p.id === saved.id ? saved : p));
        return [saved, ...prev.filter((p) => p.id !== programForm.id)];
      });
      setSelectedProgramId(saved.id);
      setProgramForm(saved);
      setProgramErrors({});
      pushToast({ type: 'success', title: 'a+Üa+¦a+Öa+ùa+¦a+üa+¬a+¦a¦Ça+úa¦ça+ê', message: 'a+Üa+¦a+Öa+ùa+¦a+üa¦éa+¢a+úa¦üa+üa+úa+ía¦Ça+úa+¦a+óa+Üa+úa¦ëa+¡a+óa¦üa+Ña¦ëa+º' });
    } catch (e) {
      console.error(e);
      setProgramErrors({ general: 'a+Üa+¦a+Öa+ùa+¦a+üa¦éa+¢a+úa¦üa+üa+úa+ía¦äa+ía¦êa+¬a+¦a¦Ça+úa¦ça+ê' });
      pushToast({ type: 'error', title: 'a¦Ça+üa+¦a+öa+éa¦ëa+¡a+£a+¦a+öa+Pa+Ña+¦a+ö', message: 'a¦äa+ía¦êa+¬a+¦a+ía+¦a+úa+ûa+Üa+¦a+Öa+ùa+¦a+üa¦éa+¢a+úa¦üa+üa+úa+ía¦äa+öa¦ë' });
    } finally {
      setLoading(false);
    }
  }

  async function deleteProgramApi(id) {
    try {
      if (looksLikeObjectId(id)) {
        await deleteProgram(id);
      }
      setPrograms((prev) => prev.filter((p) => p.id !== id));
      if (selectedProgramId === id) {
        setSelectedProgramId(null);
        setProgramForm(null);
      }
      pushToast({ type: 'success', title: 'a+Ña+Üa+¬a+¦a¦Ça+úa¦ça+ê', message: 'a+Ña+Üa¦éa+¢a+úa¦üa+üa+úa+ía¦Ça+úa+¦a+óa+Üa+úa¦ëa+¡a+óa¦üa+Ña¦ëa+º' });
    } catch (e) {
      console.error(e);
      setError('a+Ña+Üa¦éa+¢a+úa¦üa+üa+úa+ía¦äa+ía¦êa+¬a+¦a¦Ça+úa¦ça+ê');
      pushToast({ type: 'error', title: 'a¦Ça+üa+¦a+öa+éa¦ëa+¡a+£a+¦a+öa+Pa+Ña+¦a+ö', message: 'a¦äa+ía¦êa+¬a+¦a+ía+¦a+úa+ûa+Ña+Üa¦éa+¢a+úa¦üa+üa+úa+ía¦äa+öa¦ë' });
    }
  }

  async function saveWorkout() {
    const errors = {};
    if (!workoutForm.name || workoutForm.name.trim() === "") {
      errors.name = "a¦éa+¢a+úa+öa+üa+úa+¡a+üa+èa++a¦êa+¡a+ça+¦a+Öa+¥a+¦a+ü (workout)";
    }
    if (workoutForm.type === "reps") {
      if (!workoutForm.value) errors.value = "a¦éa+¢a+úa+öa+üa+úa+¡a+üa+êa+¦a+Öa+ºa+Öa+äa+úa+¦a¦ëa+ç (reps)";
    } else {
      if (!workoutForm.duration) errors.duration = "a¦éa+¢a+úa+öa+üa+úa+¡a+üa+úa+¦a+óa+¦a¦Ça+ºa+Ña+¦ (duration)";
    }
    if (Object.keys(errors).length) {
      setWorkoutErrors(errors);
      return;
    }

    const muscles = (workoutForm.musclesText || "")
      .split(",")
      .map((m) => m.trim())
      .filter(Boolean);

    const workoutToSave = {
      ...workoutForm,
      id: workoutForm.id || `w-${Date.now()}-${Math.random().toString(36).slice(2,8)}`,
      muscles,
    };

    let updatedProgram = programForm ? { ...programForm } : null;
    if (!updatedProgram) {
      const newProgram = createEmptyProgram();
      newProgram.workoutList = [workoutToSave];
      updatedProgram = newProgram;
    } else {
      const existingIndex = (updatedProgram.workoutList || []).findIndex((w) => w.id === workoutToSave.id);
      if (existingIndex > -1) {
        updatedProgram.workoutList = updatedProgram.workoutList.map((w) => (w.id === workoutToSave.id ? workoutToSave : w));
      } else {
        updatedProgram.workoutList = [...(updatedProgram.workoutList || []), workoutToSave];
      }
    }

    try {
      setLoading(true);
      let saved;
      if (!looksLikeObjectId(updatedProgram.id)) {
        saved = await createProgram(updatedProgram);
      } else {
        saved = await updateProgram(updatedProgram.id, updatedProgram);
      }
      setProgramForm(saved);
      setPrograms((prev) => {
        const exists = prev.find((p) => p.id === saved.id);
        if (exists) return prev.map((p) => (p.id === saved.id ? saved : p));
        return [saved, ...prev.filter((p) => p.id !== updatedProgram.id)];
      });
      setSelectedProgramId(saved.id);
      setEditingWorkoutId(null);
      setWorkoutForm(emptyWorkoutForm());
      setWorkoutErrors({});
      pushToast({ type: 'success', title: 'a+Üa+¦a+Öa+ùa+¦a+üa+¬a+¦a¦Ça+úa¦ça+ê', message: 'a+Üa+¦a+Öa+ùa+¦a+üa+ùa¦êa+¦a+¡a+¡a+üa+üa+¦a+Ña+¦a+ça+üa+¦a+óa¦Ça+úa+¦a+óa+Üa+úa¦ëa+¡a+óa¦üa+Ña¦ëa+º' });
    } catch (e) {
      console.error(e);
      setWorkoutErrors({ general: 'a+Üa+¦a+Öa+ùa+¦a+üa+ùa¦êa+¦a+¡a+¡a+üa+üa+¦a+Ña+¦a+ça+üa+¦a+óa¦äa+ía¦êa+¬a+¦a¦Ça+úa¦ça+ê' });
      pushToast({ type: 'error', title: 'a¦Ça+üa+¦a+öa+éa¦ëa+¡a+£a+¦a+öa+Pa+Ña+¦a+ö', message: 'a¦äa+ía¦êa+¬a+¦a+ía+¦a+úa+ûa+Üa+¦a+Öa+ùa+¦a+üa+ùa¦êa+¦a+¡a+¡a+üa+üa+¦a+Ña+¦a+ça+üa+¦a+óa¦äa+öa¦ë' });
    } finally {
      setLoading(false);
    }
  }

  // Simple mode: show only the full programs list (no editor/forms/stats)
  const simpleListOnly = false;

  // Load programs from API (or fallback empty)
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);
    fetchPrograms()
      .then((data) => {
        if (!mounted) return;
        // ensure workoutList and muscles exist
        const normalized = (data || []).map((p) => ({
          ...p,
          workoutList: (p.workoutList || []).map((w) => ({
            ...w,
            muscles: w.muscles || [],
            id: w.id || `w-${Date.now()}-${Math.random().toString(36).slice(2,8)}`,
          })),
        }));
        setPrograms(normalized);
        setLoading(false);
      })
      .catch((err) => {
        if (!mounted) return;
        console.error(err);
        setError("a¦äa+ía¦êa+¬a+¦a+ía+¦a+úa+ûa+öa+¦a+ça+éa¦ëa+¡a+ía+¦a+Ña¦éa+¢a+úa¦üa+üa+úa+ía¦äa+öa¦ë");
        setPrograms([]);
        setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  // Derived values
  const averageWorkouts = useMemo(() => {
    if (!programs.length) return 0;
    const total = programs.reduce((acc, p) => acc + (p.workoutList?.length || 0), 0);
    return Math.round(total / programs.length);
  }, [programs]);

  const filteredPrograms = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return programs;
    return programs.filter((p) => {
      if ((p.name || "").toLowerCase().includes(term)) return true;
      if ((p.description || "").toLowerCase().includes(term)) return true;
      return (p.workoutList || []).some((w) => (w.name || "").toLowerCase().includes(term));
    });
  }, [programs, searchTerm]);

  useEffect(() => {
    // ensure selection sync when programs change
    if (selectedProgramId) {
      const found = programs.find((p) => p.id === selectedProgramId);
      if (found) {
        setProgramForm(found);
      } else {
        setSelectedProgramId(null);
        setProgramForm(null);
      }
    }
  }, [programs, selectedProgramId]);

  // Handlers
  function handleAddProgram() {
    const newProgram = createEmptyProgram();
    setPrograms((prev) => [newProgram, ...prev]);
    setSelectedProgramId(newProgram.id);
    setProgramForm(newProgram);
  }

  function handleProgramFieldChange(field, value) {
    setProgramForm((prev) => {
      if (!prev) return prev;
      return { ...prev, [field]: value };
    });
  }

  function handleSaveProgram() {
    if (!programForm) return;
    const errors = {};
    if (!programForm.name || programForm.name.trim() === "") {
      errors.name = "a+üa+úa++a+ôa+¦a+üa+úa+¡a+üa+èa++a¦êa+¡a¦éa+¢a+úa¦üa+üa+úa+í";
    }
    if (Object.keys(errors).length) {
      setProgramErrors(errors);
      return;
    }
    setPrograms((prev) => {
      const exists = prev.find((p) => p.id === programForm.id);
      if (exists) {
        return prev.map((p) => (p.id === programForm.id ? { ...programForm } : p));
      } else {
        return [programForm, ...prev];
      }
    });
    setProgramErrors({});
    setSelectedProgramId(programForm.id);
  }

  function handleDeleteProgram(id) {
    setPrograms((prev) => prev.filter((p) => p.id !== id));
    if (selectedProgramId === id) {
      setSelectedProgramId(null);
      setProgramForm(null);
    }
  }

  function handleEditWorkout(workout) {
    setEditingWorkoutId(workout.id);
    setWorkoutForm({
      ...workout,
      musclesText: (workout.muscles || []).join(", "),
    });
  }

  function handleDeleteWorkout(workoutId) {
    if (!programForm) return;
    const updatedList = (programForm.workoutList || []).filter((w) => w.id !== workoutId);
    const updatedProgram = { ...programForm, workoutList: updatedList };
    setProgramForm(updatedProgram);
    setPrograms((prev) => prev.map((p) => (p.id === updatedProgram.id ? updatedProgram : p)));
    if (editingWorkoutId === workoutId) {
      setEditingWorkoutId(null);
      setWorkoutForm(emptyWorkoutForm());
    }
  }

  function handleWorkoutFieldChange(field, value) {
    setWorkoutForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleUpload(type, files) {
    if (!files || files.length === 0) return;
    const file = files[0];
    const filename = file.name;
    if (type === "image") {
      setWorkoutForm((prev) => ({ ...prev, image: filename }));
    } else if (type === "video") {
      setWorkoutForm((prev) => ({ ...prev, video: filename }));
    }
  }

  function handleSaveWorkout() {
    const errors = {};
    if (!workoutForm.name || workoutForm.name.trim() === "") {
      errors.name = "a+üa+úa++a+ôa+¦a+üa+úa+¡a+üa+èa++a¦êa+¡a+èa++a+öa¦éa+¢a+úa¦üa+üa+úa+í";
    }
    // validate either value or duration based on type
    if (workoutForm.type === "reps") {
      if (!workoutForm.value) errors.value = "a+üa+úa++a+ôa+¦a+üa+úa+¡a+üa+êa+¦a+Öa+ºa+Öa+äa+úa+¦a¦ëa+ç";
    } else {
      if (!workoutForm.duration) errors.duration = "a+üa+úa++a+ôa+¦a+üa+úa+¡a+üa+úa+¦a+óa+¦a¦Ça+ºa+Ña+¦";
    }
    if (Object.keys(errors).length) {
      setWorkoutErrors(errors);
      return;
    }

    // normalize muscles
    const muscles = (workoutForm.musclesText || "")
      .split(",")
      .map((m) => m.trim())
      .filter(Boolean);

    const workoutToSave = {
      ...workoutForm,
      id: workoutForm.id || `w-${Date.now()}-${Math.random().toString(36).slice(2,8)}`,
      muscles,
    };

    // update programForm and programs
    let updatedProgram = programForm ? { ...programForm } : null;
    if (!updatedProgram) {
      // if no program selected, create one
      const newProgram = createEmptyProgram();
      newProgram.workoutList = [workoutToSave];
      updatedProgram = newProgram;
    } else {
      const existingIndex = (updatedProgram.workoutList || []).findIndex((w) => w.id === workoutToSave.id);
      if (existingIndex > -1) {
        updatedProgram.workoutList = updatedProgram.workoutList.map((w) => (w.id === workoutToSave.id ? workoutToSave : w));
      } else {
        updatedProgram.workoutList = [...(updatedProgram.workoutList || []), workoutToSave];
      }
    }

    setProgramForm(updatedProgram);
    setPrograms((prev) => {
      const exists = prev.find((p) => p.id === updatedProgram.id);
      if (exists) {
        return prev.map((p) => (p.id === updatedProgram.id ? updatedProgram : p));
      } else {
        return [updatedProgram, ...prev];
      }
    });

    setEditingWorkoutId(null);
    setWorkoutForm(emptyWorkoutForm());
    setWorkoutErrors({});
  }

  // Early return for simple list-only view
  if (simpleListOnly) {
    return (
      <div className="programs">
        {loading ? (
          <Card className="programs__loading">
            <div className="loading-spinner"></div>
            <p>Loading programs...</p>
          </Card>
        ) : error ? (
          <Card className="programs__error">
            <p>{error}</p>
          </Card>
        ) : (
          <div className="programs__content">
            <div className="programs__list">
              <h2 className="programs__list-title">All Programs</h2>
              {programs.map((program) => (
                <Card key={program.id} className="program-item">
                  <div className="program-item__header">
                    <div className="program-item__info">
                      <h3 className="program-item__name">{program.name}</h3>
                      <p className="program-item__description">{program.description}</p>
                      <div className="program-item__meta">
                        <span className="program-item__meta-item">
                          <Clock size={14} />
                          {program.duration || "-"}
                        </span>
                        <span className="program-item__meta-item">
                          <Flame size={14} />
                          {program.caloriesBurned} kcal
                        </span>
                        <span className="program-item__meta-item">
                          <Target size={14} />
                          {program.category || "-"}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="programs">
      {/* Toasts */}
      <div className="toast-container">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast--${t.type}`}>
            <h4 className="toast__title">{t.title}</h4>
            <button className="toast__close" onClick={() => dismissToast(t.id)} aria-label="Dismiss">+ù</button>
            {t.message && <p className="toast__message">{t.message}</p>}
          </div>
        ))}
      </div>

      {/* Exercise Picker Modal */}
      {pickerOpen && (
        <div className="modal">
          <div className="modal__overlay" onClick={() => setPickerOpen(false)} />
          <div className="modal__dialog" style={{ maxWidth: '900px', width: '100%' }}>
            <div className="modal__header">
              <h3 className="modal__title">a¦Ça+Ña++a+¡a+üa+ùa¦êa+¦a+¡a+¡a+üa+üa+¦a+Ña+¦a+ça+üa+¦a+óa+êa+¦a+üa+Éa+¦a+Öa+éa¦ëa+¡a+ía+¦a+Ñ</h3>
              <button className="modal__close" onClick={() => setPickerOpen(false)}>+ù</button>
            </div>
            <div className="modal__body">
              <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
                <input
                  className="input"
                  placeholder="a+äa¦ëa+Öa+½a+¦a+òa+¦a+ía+èa++a¦êa+¡a+ùa¦êa+¦..."
                  value={exerciseQuery}
                  onChange={(e) => setExerciseQuery(e.target.value)}
                />
                <span className="badge badge--gray">a+ùa+¦a¦ëa+ça+½a+ía+ö {allExercises.length}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '12px' }}>
                {allExercises
                  .filter((ex) => (exerciseQuery ? (ex.name || '').toLowerCase().includes(exerciseQuery.toLowerCase()) : true))
                  .map((ex) => {
                    const selected = selectedExerciseIds.has(ex.id);
                    return (
                      <div key={ex.id} className={`card ${selected ? 'program-item--active' : ''}`} style={{ cursor: 'pointer' }} onClick={() => toggleSelectExercise(ex.id)}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '.5rem' }}>
                          <h4 style={{ margin: 0 }}>{ex.name}</h4>
                          <input type="checkbox" checked={selected} readOnly />
                        </div>
                        <div style={{ fontSize: '.85rem', color: '#64748b' }}>{ex.type === 'time' ? `a¦Ça+ºa+Ña+¦: ${ex.duration ?? '-'}` : `a+äa+úa+¦a¦ëa+ç: ${ex.value ?? '-'}`}</div>
                        {Array.isArray(ex.muscles) && ex.muscles.length > 0 && (
                          <div style={{ marginTop: '.5rem', display: 'flex', flexWrap: 'wrap', gap: '.25rem' }}>
                            {ex.muscles.map((m) => (
                              <span key={m} className="badge badge--blue">{m}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '.5rem', padding: '0 1.5rem 1.25rem' }}>
              <button className="btn btn--secondary" onClick={() => setPickerOpen(false)}>a+óa+üa¦Ça+Ña+¦a+ü</button>
              <button className="btn btn--primary" onClick={addSelectedExercisesToProgram}>a+Üa+¦a+Öa+ùa+¦a+üa+üa+¦a+úa¦Ça+Ña++a+¡a+ü</button>
            </div>
          </div>
        </div>
      )}
      {/* Header */}
      <div className="programs__header">
        <div className="programs__header-content">
          <div className="programs__header-icon">
            <Dumbbell size={28} />
          </div>
          <div className="programs__header-text">
            <h1 className="programs__title">a+êa+¦a+öa+üa+¦a+úa¦éa+¢a+úa¦üa+üa+úa+ía+¡a+¡a+üa+üa+¦a+Ña+¦a+ça+üa+¦a+ó</h1>
            <p className="programs__subtitle">
              a+¬a+úa¦ëa+¦a+ç a+¢a+úa+¦a+Üa¦üa+òa¦êa+ç a¦üa+Ña+¦a+êa+¦a+öa+üa+¦a+úa+èa++a+öa+ùa¦êa+¦a+¥a+¦a+üa+¡a+¡a+üa+üa+¦a+Ña+¦a+ça+üa+¦a+óa¦âa+Öa+úa+¦a+Üa+Ü
            </p>
          </div>
        </div>
        <Button onClick={handleAddProgram} disabled={loading}>
          <Plus size={16} />
          <span>a¦Ça+Pa+¦a¦êa+ía¦éa+¢a+úa¦üa+üa+úa+ía¦âa+½a+ía¦ê</span>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="programs__stats">
        <Card className="stat-card">
          <div className="stat-card__header">
            <span className="stat-card__label">a¦éa+¢a+úa¦üa+üa+úa+ía+ùa+¦a¦ëa+ça+½a+ía+ö</span>
            <div className="stat-card__icon stat-card__icon--emerald">
              <Activity size={18} />
            </div>
          </div>
          <div className="stat-card__value">{programs.length}</div>
          <p className="stat-card__description">a+êa+¦a+Öa+ºa+Öa¦éa+¢a+úa¦üa+üa+úa+ía+ùa+¦a¦êa+¡a+óa+¦a¦êa¦âa+Öa+úa+¦a+Üa+Ü</p>
        </Card>

        <Card className="stat-card">
          <div className="stat-card__header">
            <span className="stat-card__label">a+èa++a+öa+ùa¦êa+¦a¦Ça+ëa+Ña+¦a¦êa+ó</span>
            <div className="stat-card__icon stat-card__icon--blue">
              <Layers size={18} />
            </div>
          </div>
          <div className="stat-card__value">{averageWorkouts}</div>
          <p className="stat-card__description">a+êa+¦a+Öa+ºa+Öa+ùa¦êa+¦a+¥a+¦a+üa¦Ça+ëa+Ña+¦a¦êa+óa¦âa+Öa¦üa+òa¦êa+Ña+¦a¦éa+¢a+úa¦üa+üa+úa+í</p>
        </Card>

        <Card className="stat-card">
          <div className="stat-card__header">
            <span className="stat-card__label">a+£a+Ña+Ña+¦a+Pa+ÿa¦îa+üa+¦a+úa+äa¦ëa+Öa+½a+¦</span>
            <div className="stat-card__icon stat-card__icon--purple">
              <Search size={18} />
            </div>
          </div>
          <div className="stat-card__value">{filteredPrograms.length}</div>
          <p className="stat-card__description">a¦éa+¢a+úa¦üa+üa+úa+ía+ùa+¦a¦êa+òa+úa+ça+üa+¦a+Üa+äa+¦a+äa¦ëa+Öa+½a+¦</p>
        </Card>
      </div>

      {/* Search Bar */}
      <Card className="programs__search">
        <div className="programs__search-wrapper">
          <label className="programs__search-label" htmlFor="program-search">
            a+äa¦ëa+Öa+½a+¦a¦éa+¢a+úa¦üa+üa+úa+ía+½a+úa++a+¡a+ùa¦êa+¦a+¥a+¦a+ü
          </label>
          <div className="programs__search-input-wrapper">
            <Search size={18} className="programs__search-icon" />
            <Input
              id="program-search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="a+äa¦ëa+Öa+½a+¦a+òa+¦a+ía+èa++a¦êa+¡a¦éa+¢a+úa¦üa+üa+úa+ía+½a+úa++a+¡a+ùa¦êa+¦a+¥a+¦a+üa+áa+¦a+óa¦âa+Öa¦éa+¢a+úa¦üa+üa+úa+í"
              className="programs__search-input"
              disabled={loading || !!error}
            />
          </div>
          <p className="programs__search-hint">
            a+úa+¦a+Üa+Üa+êa+¦a+äa¦ëa+Öa+½a+¦a+êa+¦a+üa+èa++a¦êa+¡a¦éa+¢a+úa¦üa+üa+úa+ía¦üa+Ña+¦a+èa++a¦êa+¡a+ùa¦êa+¦a+¥a+¦a+üa+ùa+¦a¦êa+¡a+óa+¦a¦êa¦âa+Öa¦üa+òa¦êa+Ña+¦a+èa++a+öa¦éa+¢a+úa¦üa+üa+úa+ía¦éa+öa+óa+¡a+¦a+òa¦éa+Öa+ía+¦a+òa+¦
          </p>
        </div>
      </Card>

      {/* Content */}
      {loading ? (
        <Card className="programs__loading">
          <div className="loading-spinner"></div>
          <p>a+üa+¦a+Ña+¦a+ça¦éa+½a+Ña+öa+éa¦ëa+¡a+ía+¦a+Ña¦éa+¢a+úa¦üa+üa+úa+í...</p>
        </Card>
      ) : error ? (
        <Card className="programs__error">
          <p>{error}</p>
          <Button variant="secondary" onClick={() => window.location.reload()}>
            a+Ña+¡a+ça¦âa+½a+ía¦êa+¡a+¦a+üa+äa+úa+¦a¦ëa+ç
          </Button>
        </Card>
      ) : (
        <div className="programs__content">
          {/* Program List */}
          <div className="programs__list">
            <h2 className="programs__list-title">a+úa+¦a+óa+üa+¦a+úa¦éa+¢a+úa¦üa+üa+úa+í</h2>
            
            {filteredPrograms.map((program) => (
              <Card
                key={program.id}
                className={`program-item ${
                  program.id === selectedProgramId ? "program-item--active" : ""
                }`}
                onClick={() => {
                  setSelectedProgramId(program.id);
                  setProgramForm(program);
                }}
              >
                <div className="program-item__header">
                  <div className="program-item__info">
                    <h3 className="program-item__name">{program.name}</h3>
                    <p className="program-item__description">{program.description}</p>
                    
                    <div className="program-item__meta">
                      <span className="program-item__meta-item">
                        <Clock size={14} />
                        {program.duration || "-"}
                      </span>
                      <span className="program-item__meta-item">
                        <Flame size={14} />
                        {program.caloriesBurned} a¦üa+äa+Ña+¡a+úa+¦
                      </span>
                      <span className="program-item__meta-item">
                        <Target size={14} />
                        {program.category || "a¦äa+ía¦êa+úa+¦a+Üa++"}
                      </span>
                    </div>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="program-item__delete"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteProgramApi(program.id);
                    }}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>

                {program.workoutList.length > 0 && (
                  <div className="program-item__workouts">
                    {program.workoutList.map((workout) => (
                      <Badge key={workout.id} variant="gray" className="program-item__workout-badge">
                        {workout.name}
                      </Badge>
                    ))}
                  </div>
                )}
                
                {program.workoutList.length === 0 && (
                  <p className="program-item__empty">a+óa+¦a+ça¦äa+ía¦êa+ía+¦a+èa++a+öa¦éa+¢a+úa¦üa+üa+úa+í</p>
                )}
              </Card>
            ))}

            {filteredPrograms.length === 0 && (
              <Card className="programs__empty">
                <Search size={48} className="programs__empty-icon" />
                <p className="programs__empty-text">a¦äa+ía¦êa+Pa+Üa¦éa+¢a+úa¦üa+üa+úa+ía+ùa+¦a¦êa+òa+úa+ça+üa+¦a+Üa+äa+¦a+äa¦ëa+Öa+½a+¦</p>
              </Card>
            )}
          </div>

          {/* Program Details */}
          <div className="programs__details">
            {programForm ? (
              <>
                {/* Program Preview Image */}
                <Card className="program-form" style={{ marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div style={{ width: 160, height: 100, borderRadius: 12, overflow: 'hidden', background: '#f1f5f9', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {(() => {
                        const fallbackImage = (programForm.workoutList || []).find(w => w?.image)?.image || '';
                        const raw = programForm.image || fallbackImage || '';
                        const src = resolveImageUrl(raw);
                        return src ? (
                          <img src={src} alt="program preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <span style={{ color: '#94a3b8', fontSize: 12 }}>a¦äa+ía¦êa+ía+¦a+áa+¦a+Pa+òa+¦a+ºa+¡a+óa¦êa+¦a+ç</span>
                        );
                      })()}
                    </div>
                    <div style={{ flex: 1 }}>
                      <label className="form-label" htmlFor="program-image">a+Ña+¦a+ça+üa¦îa+áa+¦a+Pa¦éa+¢a+úa¦üa+üa+úa+í (URL)</label>
                      <Input
                        id="program-image"
                        value={programForm.image || ''}
                        onChange={(e) => handleProgramFieldChange('image', e.target.value)}
                        placeholder="https://example.com/preview.jpg"
                      />
                      <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem', marginTop: '.5rem' }}>
                        <label className="btn btn--secondary" style={{ cursor: 'pointer' }}>
                          a+¡a+¦a+¢a¦éa+½a+Ña+öa+úa+¦a+¢a+áa+¦a+P
                          <input
                            type="file"
                            accept="image/*"
                            style={{ display: 'none' }}
                            onChange={async (e) => {
                              try {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                const fd = new FormData();
                                fd.append('file', file);
                                const resp = await fetch('/api/upload', { method: 'POST', body: fd });
                                if (!resp.ok) throw new Error('upload failed');
                                const data = await resp.json();
                                const url = data?.url;
                                if (!url) throw new Error('no url');
                                // Set image then persist program immediately
                                const next = { ...programForm, image: url };
                                setProgramForm(next);
                                const isObjectId = (id) => typeof id === 'string' && /^[a-f0-9]{24}$/i.test(id);
                                const saved = isObjectId(next.id) ? await updateProgram(next.id, next) : await createProgram(next);
                                setProgramForm(saved);
                                setPrograms((prev) => prev.map((p) => (p.id === saved.id ? saved : p)));
                                setSelectedProgramId(saved.id);
                                pushToast({ type: 'success', title: 'a+¡a+¦a+¢a¦éa+½a+Ña+öa+úa+¦a+¢a+¬a+¦a¦Ça+úa¦ça+ê' });
                              } catch (err) {
                                console.error(err);
                                pushToast({ type: 'error', title: 'a+¡a+¦a+¢a¦éa+½a+Ña+öa+úa+¦a+¢a¦äa+ía¦êa+¬a+¦a¦Ça+úa¦ça+ê' });
                              } finally {
                                e.target.value = '';
                              }
                            }}
                          />
                        </label>
                        <span className="badge badge--gray">a+½a+úa++a+¡a¦âa+¬a¦ê URL a¦üa+Ña¦ëa+ºa+Üa+¦a+Öa+ùa+¦a+ü</span>
                      </div>
                    </div>
                  </div>
                </Card>
                {/* Program Form */}
                <Card className="program-form">
                  <div className="program-form__header">
                    <h2 className="program-form__title">a+úa+¦a+óa+Ña+¦a¦Ça+¡a+¦a+óa+öa¦éa+¢a+úa¦üa+üa+úa+í</h2>
                    <Button onClick={saveProgram}>
                      <Save size={16} />
                      <span>a+Üa+¦a+Öa+ùa+¦a+üa+éa¦ëa+¡a+ía+¦a+Ñ</span>
                    </Button>
                    <Button onClick={openExercisePicker}>
                      a¦Ça+Ña++a+¡a+üa+êa+¦a+üa+Éa+¦a+Öa+éa¦ëa+¡a+ía+¦a+Ñ
                    </Button>
                  </div>

                  <div className="program-form__body">
                    <div className="form-group">
                      <label className="form-label" htmlFor="program-name">
                        a+èa++a¦êa+¡a¦éa+¢a+úa¦üa+üa+úa+í
                      </label>
                      <Input
                        id="program-name"
                        value={programForm.name}
                        onChange={(e) => handleProgramFieldChange("name", e.target.value)}
                        placeholder="a¦Ça+èa¦êa+Ö Full Body Workout"
                      />
                      {programErrors.name && (
                        <p className="form-error">{programErrors.name}</p>
                      )}
                    </div>

                    <div className="form-group">
                      <label className="form-label" htmlFor="program-description">
                        a+úa+¦a+óa+Ña+¦a¦Ça+¡a+¦a+óa+ö (a+äa+¦a+¡a+ÿa+¦a+Üa+¦a+ó)
                      </label>
                      <Textarea
                        id="program-description"
                        rows={4}
                        value={programForm.description}
                        onChange={(e) => handleProgramFieldChange("description", e.target.value)}
                        placeholder="a+¡a+ÿa+¦a+Üa+¦a+óa¦Ça+¢a¦ëa+¦a+½a+ía+¦a+óa¦üa+Ña+¦a+Ña+¦a+üa+¬a+ôa+¦a+éa+¡a+ça¦éa+¢a+úa¦üa+üa+úa+í"
                      />
                      {programErrors.description && (
                        <p className="form-error">{programErrors.description}</p>
                      )}
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label" htmlFor="program-duration">
                          a+úa+¦a+óa+¦a¦Ça+ºa+Ña+¦a¦éa+¢a+úa¦üa+üa+úa+í
                        </label>
                        <Input
                          id="program-duration"
                          value={programForm.duration}
                          onChange={(e) => handleProgramFieldChange("duration", e.target.value)}
                          placeholder="a¦Ça+èa¦êa+Ö 10:00"
                        />
                        {programErrors.duration && (
                          <p className="form-error">{programErrors.duration}</p>
                        )}
                      </div>

                      <div className="form-group">
                        <label className="form-label" htmlFor="program-calories">
                          a+Pa+Ña+¦a+ça+ça+¦a+Öa+ùa+¦a¦êa¦Ça+£a+¦a+£a+Ña+¦a+ì (a¦üa+äa+Ña+¡a+úa+¦)
                        </label>
                        <Input
                          id="program-calories"
                          type="number"
                          value={programForm.caloriesBurned}
                          onChange={(e) => handleProgramFieldChange("caloriesBurned", e.target.value)}
                          placeholder="a¦Ça+èa¦êa+Ö 200"
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label" htmlFor="program-category">
                        a+½a+ía+ºa+öa+½a+ía+¦a¦êa¦éa+¢a+úa¦üa+üa+úa+í
                      </label>
                      <Input
                        id="program-category"
                        value={programForm.category}
                        onChange={(e) => handleProgramFieldChange("category", e.target.value)}
                        placeholder="a¦Ça+èa¦êa+Ö Cardio, Strength"
                      />
                      {programErrors.category && (
                        <p className="form-error">{programErrors.category}</p>
                      )}
                    </div>
                  </div>
                </Card>

                {/* Workout List */}
                <Card className="workout-list">
                  <div className="workout-list__header">
                    <div>
                      <h2 className="workout-list__title">a+èa++a+öa+ùa¦êa+¦a+¥a+¦a+üa¦âa+Öa¦éa+¢a+úa¦üa+üa+úa+í</h2>
                      <p className="workout-list__subtitle">
                        a¦Ça+Pa+¦a¦êa+ía+½a+úa++a+¡a¦üa+üa¦ëa¦äa+éa+úa+¦a+óa+Ña+¦a¦Ça+¡a+¦a+óa+öa+éa+¡a+ça¦üa+òa¦êa+Ña+¦a+èa++a+öa+ùa¦êa+¦a+¥a+¦a+ü
                      </p>
                    </div>
                    <Button 
                      onClick={() => setWorkoutForm(emptyWorkoutForm())} 
                      variant="secondary"
                    >
                      a+úa+¦a¦Ça+ïa¦ça+òa+ƒa+¡a+úa¦îa+í
                    </Button>
                  </div>

                  <div className="workout-list__grid">
                    {programForm.workoutList.map((workout, idx) => (
                      <Card
                        key={workout.id}
                        className="workout-card"
                        draggable
                        onDragStart={() => setDragIndex(idx)}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={() => handleReorderWorkouts(dragIndex, idx)}
                      >
                        <div className="workout-card__header">
                          <div className="workout-card__info">
                            <h3 className="workout-card__name">{workout.name}</h3>
                            <p className="workout-card__description">
                              {workout.description}
                            </p>
                            
                            {(workout.muscles || []).length > 0 && (
                              <div className="workout-card__muscles">
                                {workout.muscles.map((muscle) => (
                                  <span key={muscle} className="workout-card__muscle">
                                    #{muscle}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>

                          <div className="workout-card__actions">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditWorkout(workout)}
                            >
                              <Edit2 size={16} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="workout-card__delete"
                              onClick={() => handleDeleteWorkout(workout.id)}
                            >
                              <Trash2 size={16} />
                            </Button>
                          </div>
                        </div>

                        <div className="workout-card__footer">
                          <Badge variant={workout.type === "reps" ? "success" : "blue"}>
                            {workout.type === "reps"
                              ? `${workout.value} a+äa+úa+¦a¦ëa+ç`
                              : `${workout.duration} a+ºa+¦a+Öa+¦a+ùa+¦`}
                          </Badge>
                        </div>
                      </Card>
                    ))}

                    {programForm.workoutList.length === 0 && (
                      <Card className="workout-list__empty">
                        <Layers size={48} className="workout-list__empty-icon" />
                        <p className="workout-list__empty-text">
                          a+óa+¦a+ça¦äa+ía¦êa+ía+¦a+èa++a+öa+ùa¦êa+¦a+¥a+¦a+üa+¬a+¦a+½a+úa+¦a+Üa¦éa+¢a+úa¦üa+üa+úa+ía+Öa+¦a¦ë
                        </p>
                      </Card>
                    )}
                  </div>
                </Card>

                {/* Workout Form */}
                <Card className="workout-form">
                  <div className="workout-form__header">
                    <h2 className="workout-form__title">a¦Ça+Pa+¦a¦êa+í / a¦üa+üa¦ëa¦äa+éa+èa++a+öa¦éa+¢a+úa¦üa+üa+úa+í</h2>
                    <p className="workout-form__subtitle">
                      a+üa+úa+¡a+üa+éa¦ëa+¡a+ía+¦a+Ña+úa+¦a+óa+Ña+¦a¦Ça+¡a+¦a+óa+öa¦üa+Ña+¦a+üa+¦a+½a+Öa+öa+üa+Ña¦ëa+¦a+ía¦Ça+Öa++a¦ëa+¡a+ùa+¦a¦êa¦Ça+üa+¦a¦êa+óa+ºa+éa¦ëa+¡a+ç
                    </p>
                  </div>

                  <div className="workout-form__body">
                    <div className="form-group">
                      <label className="form-label" htmlFor="workout-name">
                        a+èa++a¦êa+¡a+èa++a+öa¦éa+¢a+úa¦üa+üa+úa+í
                      </label>
                      <Input
                        id="workout-name"
                        value={workoutForm.name}
                        onChange={(e) => handleWorkoutFieldChange("name", e.target.value)}
                        placeholder="a¦Ça+èa¦êa+Ö Warm-up Session"
                      />
                      {workoutErrors.name && (
                        <p className="form-error">{workoutErrors.name}</p>
                      )}
                    </div>

                    <div className="form-group">
                      <label className="form-label" htmlFor="workout-description">
                        a+úa+¦a+óa+Ña+¦a¦Ça+¡a+¦a+óa+öa+èa++a+öa¦éa+¢a+úa¦üa+üa+úa+í
                      </label>
                      <Textarea
                        id="workout-description"
                        rows={3}
                        value={workoutForm.description}
                        onChange={(e) => handleWorkoutFieldChange("description", e.target.value)}
                        placeholder="a+¡a+ÿa+¦a+Üa+¦a+óa+úa+¦a+óa+Ña+¦a¦Ça+¡a+¦a+óa+öa¦üa+Ña+¦a¦Ça+ùa+äa+Öa+¦a+äa+éa+¡a+ça+èa++a+öa¦éa+¢a+úa¦üa+üa+úa+í"
                      />
                      {workoutErrors.description && (
                        <p className="form-error">{workoutErrors.description}</p>
                      )}
                    </div>

                    <div className="form-group">
                      <label className="form-label" htmlFor="workout-muscles">
                        a+üa+Ña¦ëa+¦a+ía¦Ça+Öa++a¦ëa+¡a+ùa+¦a¦êa¦Ça+üa+¦a¦êa+óa+ºa+éa¦ëa+¡a+ç
                      </label>
                      <Input
                        id="workout-muscles"
                        value={workoutForm.musclesText}
                        onChange={(e) => handleWorkoutFieldChange("musclesText", e.target.value)}
                        placeholder="a+úa+¦a+Üa++a+öa¦ëa+ºa+óa¦Ça+äa+úa++a¦êa+¡a+ça+½a+ía+¦a+óa+êa++a+Ña+áa+¦a+ä a¦Ça+èa¦êa+Ö chest, arms"
                      />
                      {workoutErrors.muscles && (
                        <p className="form-error">{workoutErrors.muscles}</p>
                      )}
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label" htmlFor="workout-type">
                          a+¢a+úa+¦a¦Ça+áa+ùa+üa+¦a+úa+üa+¦a+½a+Öa+ö
                        </label>
                        <select
                          id="workout-type"
                          value={workoutForm.type}
                          onChange={(e) => handleWorkoutFieldChange("type", e.target.value)}
                          className="form-select"
                        >
                          <option value="reps">a+êa+¦a+Öa+ºa+Öa+äa+úa+¦a¦ëa+ç</option>
                          <option value="time">a+úa+¦a+óa+¦a¦Ça+ºa+Ña+¦</option>
                        </select>
                      </div>

                      {workoutForm.type === "reps" ? (
                        <div className="form-group">
                          <label className="form-label" htmlFor="workout-value">
                            a+êa+¦a+Öa+ºa+Öa+äa+úa+¦a¦ëa+ç
                          </label>
                          <Input
                            id="workout-value"
                            type="number"
                            value={workoutForm.value}
                            onChange={(e) => handleWorkoutFieldChange("value", e.target.value)}
                            placeholder="a¦Ça+èa¦êa+Ö 12"
                          />
                          {workoutErrors.value && (
                            <p className="form-error">{workoutErrors.value}</p>
                          )}
                        </div>
                      ) : (
                        <div className="form-group">
                          <label className="form-label" htmlFor="workout-duration">
                            a+úa+¦a+óa+¦a¦Ça+ºa+Ña+¦ (a+ºa+¦a+Öa+¦a+ùa+¦)
                          </label>
                          <Input
                            id="workout-duration"
                            type="number"
                            value={workoutForm.duration}
                            onChange={(e) => handleWorkoutFieldChange("duration", e.target.value)}
                            placeholder="a¦Ça+èa¦êa+Ö 60"
                          />
                          {workoutErrors.duration && (
                            <p className="form-error">{workoutErrors.duration}</p>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label" htmlFor="workout-image">
                          a+¡a+¦a+¢a¦éa+½a+Ña+öa+úa+¦a+¢a+áa+¦a+P
                        </label>
                        <div className="file-upload">
                          <label className="file-upload__label">
                            <Upload size={16} />
                            <span>a¦Ça+Ña++a+¡a+üa+úa+¦a+¢a+áa+¦a+P</span>
                            <input
                              id="workout-image"
                              type="file"
                              accept="image/*"
                              className="file-upload__input"
                              onChange={(e) => handleUpload("image", e.target.files)}
                            />
                          </label>
                          {workoutForm.image && (
                            <span className="file-upload__filename">{workoutForm.image}</span>
                          )}
                        </div>
                      </div>

                      <div className="form-group">
                        <label className="form-label" htmlFor="workout-video">
                          a+¡a+¦a+¢a¦éa+½a+Ña+öa+ºa+¦a+öa+¦a¦éa+¡a+¬a+¡a+Ö
                        </label>
                        <div className="file-upload">
                          <label className="file-upload__label">
                            <Upload size={16} />
                            <span>a¦Ça+Ña++a+¡a+üa+ºa+¦a+öa+¦a¦éa+¡</span>
                            <input
                              id="workout-video"
                              type="file"
                              accept="video/*"
                              className="file-upload__input"
                              onChange={(e) => handleUpload("video", e.target.files)}
                            />
                          </label>
                          {workoutForm.video && (
                            <span className="file-upload__filename">{workoutForm.video}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="workout-form__actions">
                      <Button 
                        variant="secondary" 
                        onClick={() => {
                          setWorkoutForm(emptyWorkoutForm());
                          setEditingWorkoutId(null);
                        }}
                      >
                        a+úa+¦a¦Ça+ïa¦ça+ò
                      </Button>
                      <Button onClick={saveWorkout}>
                        <Save size={16} />
                        <span>
                          {editingWorkoutId ? "a+¡a+¦a+¢a¦Ça+öa+òa+èa++a+öa¦éa+¢a+úa¦üa+üa+úa+í" : "a¦Ça+Pa+¦a¦êa+ía+èa++a+öa¦éa+¢a+úa¦üa+üa+úa+í"}
                        </span>
                      </Button>
                    </div>
                  </div>
                </Card>
              </>
            ) : (
              <Card className="programs__no-selection">
                <Dumbbell size={64} className="programs__no-selection-icon" />
                <p className="programs__no-selection-text">
                  a¦Ça+Ña++a+¡a+üa¦éa+¢a+úa¦üa+üa+úa+ía¦Ça+Pa++a¦êa+¡a+öa+¦a+úa+¦a+óa+Ña+¦a¦Ça+¡a+¦a+óa+ö
                </p>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
