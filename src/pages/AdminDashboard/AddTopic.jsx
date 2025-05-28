import React, { useState, useEffect, useRef } from "react";
import {
  Form,
  Input,
  Upload,
  Button,
  Select,
  message,
  Card,
  Switch,
} from "antd";
import {
  UploadOutlined,
  LoadingOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { fireStore } from "../../config/firebase";
import { supabase } from "../../config/supabase";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { collection, addDoc, getDocs } from "firebase/firestore";
import { useNavigate, Link } from "react-router-dom";
import "../../assets/css/addtopic.css";

const { Option } = Select;

const AddContent = () => {
  const navigate = useNavigate();
  const editor = useRef(null);
  const [description, setDescription] = useState("");
  const [uploading, setUploading] = useState(false);
  const [classes, setClasses] = useState([]);
  const [addingClass, setAddingClass] = useState(false);
  const [newClass, setNewClass] = useState("");
  const [isPaid, setIsPaid] = useState(false); // Toggle for paid content
  const [form] = Form.useForm();
  const [contentTypes, setContentTypes] = useState([]);
  const [newContentType, setNewContentType] = useState("");
  const [addingContentType, setAddingContentType] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const [newSubject, setNewSubject] = useState("");
  const [addingSubject, setAddingSubject] = useState(false);

  useEffect(() => {
    const fetchClasses = async () => {
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

    fetchClasses();
  }, [form]);

  useEffect(() => {
    const fetchContentTypes = async () => {
      try {
        const querySnapshot = await getDocs(
          collection(fireStore, "contentTypes")
        );
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

    fetchContentTypes();
  }, []);
  
  useEffect(() => {
    const fetchSubjects = async () => {
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

    fetchSubjects();
  }, []);

  const handleAddContentType = async () => {
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

  const handleAddSubject = async () => {
    if (
      newSubject &&
      !subjects.some(
        (sub) => sub.name.toLowerCase() === newSubject.toLowerCase()
      )
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

  const onFinish = async (values) => {
    const {
      topic,
      class: selectedClasses,
      subject,
      contentType,
      file,
    } = values;

    setUploading(true);
    let fileUrls = [];

    try {
      if (file && file.length > 0) {
        const uploadPromises = file.map(async (fileItem) => {
          const uniqueFileName = `${Date.now()}-${fileItem.name}`;
          const { data, error } = await supabase.storage
            .from("topics") // your Supabase bucket name
            .upload(uniqueFileName, fileItem.originFileObj, {
              cacheControl: "3600",
              upsert: false,
            });

          if (error) {
            console.error("Upload failed:", error.message);
            message.error("File upload failed.", 3);
            throw error;
          }

          const {
            data: { publicUrl },
          } = supabase.storage.from("topics").getPublicUrl(data.path);

          fileUrls.push({ url: publicUrl, fileName: fileItem.name });
        });
        await Promise.all(uploadPromises);
      }

      const topicData = {
        topic: topic || "",
        class: selectedClasses.join(", "),
        subject: (subject || "").trim().toLowerCase(), // keep only this one
        contentType: contentType || "",
        description: description || "",
        fileUrls,
        isPaid: isPaid,
        timestamp: new Date(),
      };
      console.log("Topic Data:", topicData);

      await addDoc(collection(fireStore, "topics"), topicData);

      if (isPaid) {
        // Changed collection name here only
        await addDoc(collection(fireStore, "premiumtests"), topicData);
      }

      message.success("Topic created successfully!", 3);
      localStorage.removeItem("draft");
      form.resetFields();
      setDescription("");
      setIsPaid(false);
    } catch (e) {
      console.error("Error saving topic:", e);
      message.error("Failed to save topic.", 3);
    } finally {
      setUploading(false);
    }
  };

  const handleAddClass = async () => {
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

  return (
    <div className="form-container mt-2">
      <h1 className="text-center mb-2 py-5">Create New Topic</h1>

      <Card
        bordered={false}
        style={{ margin: "20px auto", width: "100%", borderRadius: "10px" }}
      >
        <Form
          layout="vertical"
          onFinish={onFinish}
          autoComplete="off"
          form={form}
        >
          <Form.Item label="Topic Name" name="topic">
            <Input placeholder="Enter topic name" />
          </Form.Item>

          <Form.Item
            label="Class"
            name="class"
            rules={[{ required: true, message: "Please select a class!" }]}
          >
            <Select
              mode="multiple"
              placeholder="Select class(es)"
              dropdownRender={(menu) => (
                <>
                  {menu}
                  <div
                    style={{ display: "flex", flexWrap: "nowrap", padding: 8 }}
                  >
                    <Input
                      style={{ flex: "auto" }}
                      placeholder="Add new class"
                      value={newClass}
                      onChange={(e) => setNewClass(e.target.value)}
                      onPressEnter={handleAddClass}
                    />
                    <Button
                      type="primary"
                      icon={addingClass ? <LoadingOutlined /> : <PlusOutlined />}
                      onClick={handleAddClass}
                    >
                      {addingClass ? "Adding..." : "Add"}
                    </Button>
                  </div>
                </>
              )}
            >
              {classes.map((classOption) => (
                <Option key={classOption.id} value={classOption.name}>
                  {classOption.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Subject"
            name="subject"
            rules={[{ required: true, message: "Please select a subject!" }]}
          >
            <Select
              placeholder="Select a subject"
              dropdownRender={(menu) => (
                <>
                  {menu}
                  <div
                    style={{ display: "flex", flexWrap: "nowrap", padding: 8 }}
                  >
                    <Input
                      style={{ flex: "auto" }}
                      placeholder="Add new subject"
                      value={newSubject}
                      onChange={(e) => setNewSubject(e.target.value)}
                      onPressEnter={handleAddSubject}
                    />
                    <Button
                      type="primary"
                      icon={addingSubject ? <LoadingOutlined /> : <PlusOutlined />}
                      onClick={handleAddSubject}
                    >
                      {addingSubject ? "Adding..." : "Add"}
                    </Button>
                  </div>
                </>
              )}
            >
              {subjects.map((subject) => (
                <Option key={subject.id} value={subject.name}>
                  {subject.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Content Type"
            name="contentType"
            rules={[{ required: true, message: "Please select a content type!" }]}
          >
            <Select
              placeholder="Select a content type"
              dropdownRender={(menu) => (
                <>
                  {menu}
                  <div
                    style={{ display: "flex", flexWrap: "nowrap", padding: 8 }}
                  >
                    <Input
                      style={{ flex: "auto" }}
                      placeholder="Add new content type"
                      value={newContentType}
                      onChange={(e) => setNewContentType(e.target.value)}
                      onPressEnter={handleAddContentType}
                    />
                    <Button
                      type="primary"
                      icon={
                        addingContentType ? <LoadingOutlined /> : <PlusOutlined />
                      }
                      onClick={handleAddContentType}
                    >
                      {addingContentType ? "Adding..." : "Add"}
                    </Button>
                  </div>
                </>
              )}
            >
              {contentTypes.map((type) => (
                <Option key={type.value} value={type.value}>
                  {type.label}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item label="Description" name="description">
            <Input.TextArea
              placeholder="Enter description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </Form.Item>

          <Form.Item
            label="Upload File"
            name="file"
            valuePropName="fileList"
            getValueFromEvent={(e) =>
              Array.isArray(e) ? e : e && e.fileList
            }
          >
            <Upload
              name="file"
              beforeUpload={() => false}
              accept=".jpg,.jpeg,.png,.pdf"
              multiple
            >
              <Button icon={<UploadOutlined />}>Click to Upload</Button>
            </Upload>
          </Form.Item>

          <Form.Item label="Upload as Paid Content">
            <Switch
              checked={isPaid}
              onChange={(checked) => setIsPaid(checked)}
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={uploading}
              style={{ width: "100%" }}
            >
              {uploading ? "Uploading..." : "Create Topic"}
            </Button>
          </Form.Item>

          {/* Added Links to Dashboard */}
      <div className="additional-links">
        <Link to="/dashboard/allowusers" style={{ marginRight: 20 }}>
          Manage Users
        </Link>
        <Link to="/dashboard/manageContent">Manage Content</Link>
      </div>
        </Form>
      </Card>

      
    </div>
  );
};

export default AddContent;
