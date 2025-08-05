// utils/addFunctions.js
import { collection, addDoc, getDocs } from "firebase/firestore";
import { message } from "antd";
import { fireStore } from "../config/firebase";

// 📌 Fetch Classes
export const fetchClasses = async (form, setClasses, setDescription) => {
  const querySnapshot = await getDocs(collection(fireStore, "classes"));
  const fetchedClasses = querySnapshot.docs.map((doc) => ({
    id: doc.id,
    name: doc.data().name,
  }));
  setClasses(fetchedClasses);

  const draft = JSON.parse(localStorage.getItem("draft"));
  if (draft) {
    setDescription(draft.description || "");
    form.setFieldsValue(draft);
  }
};

// 📌 Fetch Subjects
export const fetchSubjects = async (setSubjects) => {
  try {
    const querySnapshot = await getDocs(collection(fireStore, "subjects"));
    const fetchedSubjects = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      name: doc.data().name,
    }));
    setSubjects(fetchedSubjects);
  } catch (error) {
    console.error("Failed to fetch subjects:", error);
    message.error("Error loading subjects.");
  }
};

// 📌 Fetch Content Types
export const fetchContentTypes = async (setContentTypes) => {
  try {
    const querySnapshot = await getDocs(collection(fireStore, "contentTypes"));
    const types = querySnapshot.docs.map((doc) => ({
      label: doc.data().label,
      value: doc.data().value,
    }));
    setContentTypes(types);
  } catch (error) {
    console.error("Failed to fetch content types:", error);
    message.error("Error loading content types.");
  }
};

// 📌 Fetch ECAT Content Types
export const fetchEcatContentTypes = async (setEcatContentTypes) => {
  try {
    const querySnapshot = await getDocs(collection(fireStore, "ecatContentTypes"));
    const types = querySnapshot.docs.map((doc) => ({
      label: doc.data().label,
      value: doc.data().value,
    }));
    setEcatContentTypes(types);
  } catch (error) {
    console.error("Failed to fetch ECAT content types:", error);
    message.error("Error loading ECAT content types.");
  }
};

// 📌 Fetch Primary Content Types
export const fetchPrimaryContentTypes = async (setPrimaryContentTypes) => {
  try {
    const querySnapshot = await getDocs(collection(fireStore, "primaryContentTypes"));
    const types = querySnapshot.docs.map((doc) => ({
      label: doc.data().label,
      value: doc.data().value,
    }));
    setPrimaryContentTypes(types);
  } catch (error) {
    console.error("Failed to fetch primary content types:", error);
    message.error("Error loading primary content types.");
  }
};

// 📌 Add Subject
export const handleAddSubject = async (
  newSubject,
  setSubjects,
  subjects,
  setNewSubject,
  setAddingSubject
) => {
  if (
    newSubject &&
    !subjects.some((sub) => sub.name.toLowerCase() === newSubject.toLowerCase())
  ) {
    setAddingSubject(true);
    try {
      const docRef = await addDoc(collection(fireStore, "subjects"), {
        name: newSubject,
      });
      setSubjects([...subjects, { id: docRef.id, name: newSubject }]);
      setNewSubject("");
      message.success(`Subject "${newSubject}" added successfully!`, 3);
    } catch (e) {
      console.error("Error adding subject:", e);
      message.error("Failed to add subject.", 3);
    } finally {
      setAddingSubject(false);
    }
  }
};

// 📌 Add Class
export const handleAddClass = async (
  newClass,
  classes,
  setClasses,
  setNewClass,
  setAddingClass
) => {
  if (newClass && !classes.some((cls) => cls.name === newClass)) {
    setAddingClass(true);
    try {
      const docRef = await addDoc(collection(fireStore, "classes"), {
        name: newClass,
      });
      setClasses([...classes, { id: docRef.id, name: newClass }]);
      setNewClass("");
      message.success(`Class "${newClass}" added successfully!`, 3);
    } catch (e) {
      console.error("Error adding class:", e);
      message.error("Failed to add class.", 3);
    } finally {
      setAddingClass(false);
    }
  }
};

// 📌 Add Content Type
export const handleAddContentType = async (
  newContentType,
  contentTypes,
  setContentTypes,
  setNewContentType,
  setAddingContentType
) => {
  if (
    newContentType &&
    !contentTypes.some(
      (type) =>
        type.label.toLowerCase() === newContentType.toLowerCase() ||
        type.value.toLowerCase() === newContentType.toLowerCase()
    )
  ) {
    setAddingContentType(true);
    try {
      const newType = {
        label: newContentType,
        value: newContentType.toLowerCase().replace(/\s+/g, "-"),
      };
      await addDoc(collection(fireStore, "contentTypes"), newType);
      setContentTypes([...contentTypes, newType]);
      setNewContentType("");
      message.success(`Content type "${newType.label}" added!`);
    } catch (e) {
      console.error("Error adding content type:", e);
      message.error("Failed to add content type.");
    } finally {
      setAddingContentType(false);
    }
  }
};

// 📌 Add ECAT Content Type
export const handleAddEcatContentType = async (
  newEcatContentType,
  ecatContentTypes,
  setEcatContentTypes,
  setNewEcatContentType,
  setAddingEcatContentType,
  form
) => {
  if (
    newEcatContentType &&
    !ecatContentTypes.some(
      (type) =>
        type.label.toLowerCase() === newEcatContentType.toLowerCase() ||
        type.value.toLowerCase() === newEcatContentType.toLowerCase()
    )
  ) {
    setAddingEcatContentType(true);
    try {
      const newType = {
        label: newEcatContentType,
        value: newEcatContentType.toLowerCase().replace(/\s+/g, "-"),
      };
      await addDoc(collection(fireStore, "ecatContentTypes"), newType);
      setEcatContentTypes([...ecatContentTypes, newType]);
      setNewEcatContentType("");
      form.setFieldsValue({ ecatContentType: newType.value });
      message.success(`ECAT content type "${newType.label}" added!`);
    } catch (e) {
      console.error("Error adding ECAT content type:", e);
      message.error("Failed to add ECAT content type.");
    } finally {
      setAddingEcatContentType(false);
    }
  }
};

// 📌 Add Primary Content Type
export const handleAddPrimaryContentType = async (
  newPrimaryContentType,
  primaryContentTypes,
  setPrimaryContentTypes,
  setNewPrimaryContentType,
  setAddingPrimaryContentType,
  form
) => {
  if (
    newPrimaryContentType &&
    !primaryContentTypes.some(
      (type) =>
        type.label.toLowerCase() === newPrimaryContentType.toLowerCase() ||
        type.value.toLowerCase() === newPrimaryContentType.toLowerCase()
    )
  ) {
    setAddingPrimaryContentType(true);
    try {
      const newType = {
        label: newPrimaryContentType,
        value: newPrimaryContentType.toLowerCase().replace(/\s+/g, "-"),
      };
      await addDoc(collection(fireStore, "primaryContentTypes"), newType);
      setPrimaryContentTypes([...primaryContentTypes, newType]);
      setNewPrimaryContentType("");
      form.setFieldsValue({ primaryContentType: newType.value });
      message.success(`Primary content type "${newType.label}" added!`);
    } catch (e) {
      console.error("Error adding primary content type:", e);
      message.error("Failed to add primary content type.");
    } finally {
      setAddingPrimaryContentType(false);
    }
  }
};
