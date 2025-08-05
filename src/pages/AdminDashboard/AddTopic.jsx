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
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../../config/supabase";
import {
  fetchClasses,
  fetchSubjects,
  fetchContentTypes,
  fetchEcatContentTypes,
  fetchPrimaryContentTypes,
  handleAddClass,
  handleAddSubject,
  handleAddContentType,
  handleAddEcatContentType,
  handleAddPrimaryContentType,
} from "../../utils/addfunctions";
import { collection, addDoc } from "firebase/firestore";
import { fireStore } from "../../config/firebase";
import "../../assets/css/addtopic.css";

const { Option } = Select;

const AddContent = () => {
  const navigate = useNavigate();
  const editor = useRef(null);
  const [description, setDescription] = useState("");
  const [uploading, setUploading] = useState(false);
  const [classes, setClasses] = useState([]);
  const [selectedClasses, setSelectedClasses] = useState([]);
  const [addingClass, setAddingClass] = useState(false);
  const [newClass, setNewClass] = useState("");
  const [isPaid, setIsPaid] = useState(false);
  const [form] = Form.useForm();
  const [contentTypes, setContentTypes] = useState([]);
  const [newContentType, setNewContentType] = useState("");
  const [addingContentType, setAddingContentType] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const [newSubject, setNewSubject] = useState("");
  const [addingSubject, setAddingSubject] = useState(false);
  const [ecatContentTypes, setEcatContentTypes] = useState([]);
  const [newEcatContentType, setNewEcatContentType] = useState("");
  const [addingEcatContentType, setAddingEcatContentType] = useState(false);
  const [primaryContentTypes, setPrimaryContentTypes] = useState([]);
  const [newPrimaryContentType, setNewPrimaryContentType] = useState("");
  const [addingPrimaryContentType, setAddingPrimaryContentType] = useState(false);

  useEffect(() => {
    fetchClasses(form, setClasses, setDescription);
  }, [form]);

  useEffect(() => {
    fetchContentTypes(setContentTypes);
    fetchSubjects(setSubjects);
    fetchEcatContentTypes(setEcatContentTypes);
    fetchPrimaryContentTypes(setPrimaryContentTypes);
  }, []);

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
            .from("topics")
            .upload(uniqueFileName, fileItem.originFileObj, {
              cacheControl: "3600",
              upsert: false,
            });

          if (error) throw error;

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
        subject: (subject || "").trim().toLowerCase(),
        contentType: contentType || "",
        ecatcontentType: values.ecatContentType || "",
        primaryContentType: values.primaryContentType || "",
        description: description || "",
        fileUrls,
        isPaid: isPaid,
        timestamp: new Date(),
      };

      await addDoc(collection(fireStore, "topics"), topicData);

      if (isPaid) {
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

  return (
    <div className="form-container mt-2">
      <h1 className="text-center mb-2 py-5">Create New Topic</h1>

      <Card bordered={false} style={{ margin: "20px auto", width: "100%", borderRadius: "10px" }}>
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
              onChange={(value) => setSelectedClasses(value)} // ← track class changes
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

          <Form.Item label="ECAT Content Type" name="ecatContentType">
            <Select
              placeholder="Select ECAT content type"
              dropdownRender={(menu) => (
                <>
                  {menu}
                  <div
                    style={{ display: "flex", flexWrap: "nowrap", padding: 8 }}
                  >
                    <Input
                      style={{ flex: "auto" }}
                      placeholder="Add new ECAT content type"
                      value={newEcatContentType}
                      onChange={(e) => setNewEcatContentType(e.target.value)}
                      onPressEnter={handleAddEcatContentType}
                    />
                    <Button
                      type="primary"
                      icon={
                        addingEcatContentType ? (
                          <LoadingOutlined />
                        ) : (
                          <PlusOutlined />
                        )
                      }
                      onClick={handleAddEcatContentType}
                    >
                      {addingEcatContentType ? "Adding..." : "Add"}
                    </Button>
                  </div>
                </>
              )}
            >
              {ecatContentTypes.map((type) => (
                <Option key={type.value} value={type.value}>
                  {type.label}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item label="Primary Content Type" name="primaryContentType">
            <Select
              placeholder="Select primary content type"
              dropdownRender={(menu) => (
                <>
                  {menu}
                  <div
                    style={{ display: "flex", flexWrap: "nowrap", padding: 8 }}
                  >
                    <Input
                      style={{ flex: "auto" }}
                      placeholder="Add new primary content type"
                      value={newPrimaryContentType}
                      onChange={(e) => setNewPrimaryContentType(e.target.value)}
                      onPressEnter={handleAddPrimaryContentType}
                    />
                    <Button
                      type="primary"
                      icon={
                        addingPrimaryContentType ? (
                          <LoadingOutlined />
                        ) : (
                          <PlusOutlined />
                        )
                      }
                      onClick={handleAddPrimaryContentType}
                    >
                      {addingPrimaryContentType ? "Adding..." : "Add"}
                    </Button>
                  </div>
                </>
              )}
            >
              {primaryContentTypes.map((type) => (
                <Option key={type.value} value={type.value}>
                  {type.label}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Subject"
            name="subject"
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
                      icon={
                        addingSubject ? <LoadingOutlined /> : <PlusOutlined />
                      }
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
          >
            <Select
              placeholder={
                selectedClasses.includes("ECAT")
                  ? "Select ECAT content type"
                  : "Select content type"
              }
              dropdownRender={(menu) => (
                <>
                  {menu}
                  <div
                    style={{ display: "flex", flexWrap: "nowrap", padding: 8 }}
                  >
                    <Input
                      style={{ flex: "auto" }}
                      placeholder={
                        selectedClasses.includes("ECAT")
                          ? "Add new ECAT content type"
                          : "Add new content type"
                      }
                      value={
                        selectedClasses.includes("ECAT")
                          ? newEcatContentType
                          : newContentType
                      }
                      onChange={(e) =>
                        selectedClasses.includes("ECAT")
                          ? setNewEcatContentType(e.target.value)
                          : setNewContentType(e.target.value)
                      }
                      onPressEnter={
                        selectedClasses.includes("ECAT")
                          ? handleAddEcatContentType
                          : handleAddContentType
                      }
                    />
                    <Button
                      type="primary"
                      icon={
                        selectedClasses.includes("ECAT") ? (
                          addingEcatContentType ? (
                            <LoadingOutlined />
                          ) : (
                            <PlusOutlined />
                          )
                        ) : addingContentType ? (
                          <LoadingOutlined />
                        ) : (
                          <PlusOutlined />
                        )
                      }
                      onClick={
                        selectedClasses.includes("ECAT")
                          ? handleAddEcatContentType
                          : handleAddContentType
                      }
                    >
                      {selectedClasses.includes("ECAT")
                        ? addingEcatContentType
                          ? "Adding..."
                          : "Add"
                        : addingContentType
                        ? "Adding..."
                        : "Add"}
                    </Button>
                  </div>
                </>
              )}
            >
              {(selectedClasses.includes("ECAT")
                ? ecatContentTypes
                : contentTypes
              ).map((type) => (
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






















