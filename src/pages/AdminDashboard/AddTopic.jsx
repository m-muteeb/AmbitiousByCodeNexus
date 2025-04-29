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
import { storage, fireStore } from "../../config/firebase";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { collection, addDoc, getDocs } from "firebase/firestore";
import { useNavigate, Link } from "react-router-dom";
import "../../assets/css/addtopic.css";

const { Option } = Select;

const AddContent = () => {

  const contentTypes = [
    { label: "📖 Book Lessons", value: "book-lessons" },
    { label: "📝 MCQs", value: "mcqs" },
    { label: "📜 Past Papers", value: "past-papers" },
    { label: "📜 Kamiyab Series", value: "kamiyab-series" }, // use lowercase for consistency
  ];
  
  const navigate = useNavigate();
  const editor = useRef(null);
  const [description, setDescription] = useState("");
  const [uploading, setUploading] = useState(false);
  const [classes, setClasses] = useState([]);
  const [addingClass, setAddingClass] = useState(false);
  const [newClass, setNewClass] = useState("");
  const [isPaid, setIsPaid] = useState(false); // Toggle for paid content
  // const [subject, setSubject] = useState(""); // For subject input
  const [form] = Form.useForm();

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
        const uploadPromises = file.map((fileItem) => {
          const uniqueFileName = `${Date.now()}-${fileItem.name}`;
          const storageRef = ref(storage, `uploads/${uniqueFileName}`);
          const uploadTask = uploadBytesResumable(
            storageRef,
            fileItem.originFileObj
          );

          return new Promise((resolve, reject) => {
            uploadTask.on(
              "state_changed",
              (snapshot) => {
                const progress =
                  (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                console.log(`Upload is ${progress}% done`);
              },
              (error) => {
                console.error("Upload failed:", error);
                message.error("File upload failed.", 3);
                reject(error);
              },
              async () => {
                const downloadURL = await getDownloadURL(
                  uploadTask.snapshot.ref
                );
                const fileName = fileItem.name;
                fileUrls.push({ url: downloadURL, fileName });
                resolve();
              }
            );
          });
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
        await addDoc(collection(fireStore, "institutionpdfs"), topicData);
      }

      message.success("Topic created successfully!", 3);
      localStorage.removeItem("draft");
      form.resetFields();
      setDescription("");
      setIsPaid(false);
      // setSubject("");
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
                      icon={
                        addingClass ? <LoadingOutlined /> : <PlusOutlined />
                      }
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

          <Form.Item label="Subject" name="subject">
            <Input placeholder="Enter your subject" />
          </Form.Item>
          <Form.Item
            label="Content Type"
            name="contentType"
            rules={[
              { required: true, message: "Please select a content type!" },
            ]}
          >
            <Select placeholder="Select a content type">
              {contentTypes.map((type) => (
                <Option key={type.value} value={type.value}>
                  {type.label}
                </Option>
              ))}
            </Select>
          </Form.Item>

          {/* Show subject only when isPaid is true */}

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
            getValueFromEvent={(e) => (Array.isArray(e) ? e : e && e.fileList)}
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
          {/* {isPaid && (
            <Form.Item label="Subject" name="subject">
              <Input
                placeholder="Enter subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </Form.Item>
          )} */}

          <Form.Item>
            <Button type="primary" htmlType="submit" block disabled={uploading}>
              {uploading ? <LoadingOutlined /> : "Submit"}
            </Button>
          </Form.Item>

          <Form.Item>
            <Button
              type="default"
              block
              onClick={() => navigate("/dashboard/manageContent")}
            >
              Manage Topics
            </Button>
          </Form.Item>

          <Form.Item>
            <Link to="/dashboard/allowusers">
              <Button type="dashed" block>
                Allow Institution Access
              </Button>
            </Link>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default AddContent;
