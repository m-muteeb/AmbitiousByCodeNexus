import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Popconfirm,
  message,
  Modal,
  Form,
  Input,
  Select,
  Upload,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { fireStore, storage } from "../../config/firebase";
import { deleteObject, getDownloadURL, ref, uploadBytes } from "firebase/storage";

const ManageContent = () => {
  const [products, setProducts] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [previousSubCategory, setPreviousSubCategory] = useState(""); // Fix #1
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [classes, setClasses] = useState([]);
  const [newFiles, setNewFiles] = useState([]);

  useEffect(() => {
    fetchProducts();
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const querySnapshot = await getDocs(collection(fireStore, "classes"));
      const classList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setClasses(classList);
    } catch (error) {
      message.error("Failed to fetch classes.");
      console.error(error);
    }
  };

  const fetchProducts = async () => {
    try {
      const q = query(
        collection(fireStore, "topics"),
        orderBy("timestamp", "desc")
      );
      const querySnapshot = await getDocs(q);
      const productList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setProducts(productList);
    } catch (error) {
      message.error("Failed to fetch products.");
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    setDeleting(true);
    try {
      await deleteDoc(doc(fireStore, "topics", id));
      message.success("Product deleted successfully!");
      setProducts((prev) => prev.filter((product) => product.id !== id));
    } catch (error) {
      message.error("Failed to delete product.");
      console.error(error);
    } finally {
      setDeleting(false);
    }
  };

  const handleEdit = (record) => {
    setEditingProduct(record);
    setPreviousSubCategory(record.subcategory || ""); // Ensures previous subcategory is stored

    form.setFieldsValue({
      topic: record.topic,
      class: record.class,
      subcategory: record.subcategory, // Ensure this is populated
      description: record.description || "",
      fileUrls: record.fileUrls || [], // Store previous file URLs
    });

    setIsModalVisible(true);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    form.resetFields();
    setLoading(false);
  };

  const handleRemoveFile = async (index, productId) => {
    const fileURL = editingProduct.fileUrls[index];

    if (!fileURL) return;

    // Extract file reference from the URL
    const fileRef = ref(storage, fileURL);

    try {
      // Step 1: Delete file from Firebase Storage
      await deleteObject(fileRef);
      console.log("File deleted successfully from Storage");

      // Step 2: Update Firestore to remove the file URL
      const updatedFiles = editingProduct.fileUrls.filter(
        (_, i) => i !== index
      );
      const productRef = doc(fireStore, "topics", productId); // Adjust collection name if needed

      await updateDoc(productRef, { fileUrls: updatedFiles });
      console.log("File URL removed from Firestore");

      // Step 3: Update local state
      setEditingProduct((prev) => ({ ...prev, fileUrls: updatedFiles }));
    } catch (error) {
      console.error("Error deleting file:", error);
    }
  };

  const handleUpdate = async (values) => {
    setLoading(true);
    try {
      const updatedValues = { ...values, timestamp: serverTimestamp() };
      const productRef = doc(fireStore, "topics", editingProduct.id);
  
      // Upload new files if any
      if (newFiles.length > 0) {
        const uploadedfileUrls = await Promise.all(
          newFiles.map(async (file) => {
            const fileRef = ref(storage, `topics/${editingProduct.id}/${file.name}`);
            await uploadBytes(fileRef, file);
            return await getDownloadURL(fileRef);
          })
        );
  
        // Merge old and new file URLs
        updatedValues.fileUrls = [
          ...(editingProduct.fileUrls || []),
          ...uploadedfileUrls,
        ];
      }
  
      // Update Firestore
      await updateDoc(productRef, updatedValues);
      message.success("Product updated successfully!");
  
      // Reset modal state
      setNewFiles([]); // Clear uploaded files list
      handleModalClose();
      fetchProducts(); // Refresh product list
    } catch (error) {
      message.error("Failed to update product.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  

  const columns = [
    { title: "Topic", dataIndex: "topic", key: "topic" },
    { title: "Class", dataIndex: "class", key: "class" },
    { title: "SubCategory", dataIndex: "subcategory", key: "subcategory" },
    { title: "Description", dataIndex: "description", key: "description" },
    {
      title: "File",
      dataIndex: "fileUrls",
      key: "fileUrls",
      render: (fileUrls) =>
        fileUrls && fileUrls.length > 0
          ? fileUrls.map((url, index) => (
              <div key={index}>
                <a href={url} target="_blank" rel="noopener noreferrer">
                  View File {index + 1}
                </a>
              </div>
            ))
          : "No file",
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <>
          <Button
            icon={<EditOutlined />}
            style={{ margin: 3, color: "green" }}
            onClick={() => handleEdit(record)}
            loading={loading}
          />
          <Popconfirm
            title="Are you sure to delete this product?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              style={{ color: "red", margin: 3 }}
              icon={<DeleteOutlined />}
              danger
              loading={deleting}
            />
          </Popconfirm>
        </>
      ),
    },
  ];

  return (
    <>
    <h2
        className="text-center py-5"
        style={{ textAlign: "center", paddingBottom: "20px" }}
      >
        Manage Products
      </h2>
    <div
      className="container"
      style={{ padding: "20px",margin:"0", fontFamily: "Arial, sans-serif" }}
    >
      
      <div className="table-responsive">

      <Table dataSource={products} columns={columns} rowKey="id" bordered />
      </div>
      <Modal
        title="Edit Product"
        visible={isModalVisible}
        onCancel={handleModalClose}
        footer={null}
        width={1000}
        className="responsive-modal"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleUpdate}
          className="responsive-form"
        >
          <Form.Item label="Topic" name="topic">
            <Input placeholder="Enter topic" />
          </Form.Item>

          <Form.Item label="Class" name="class">
            <Select placeholder="Select class">
              {classes.map((classOption) => (
                <Select.Option key={classOption.id} value={classOption.name}>
                  {classOption.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item label="SubCategory" name="subcategory">
            <Input placeholder="Enter subcategory" />
          </Form.Item>

          <Form.Item label="Description" name="description">
            <Input.TextArea placeholder="Enter description" rows={4} />
          </Form.Item>

          <Form.Item label="Uploaded Files">
            {editingProduct?.fileUrls?.length > 0 ? (
              editingProduct.fileUrls.map((url, index) => (
                <div
                  key={index}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: "8px",
                  }}
                >
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ marginRight: "8px" }}
                  >
                    View File {index + 1}
                  </a>
                  <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => handleRemoveFile(index, editingProduct?.id)} // ✅ Ensure id is passed
                  />
                </div>
              ))
            ) : (
              <p>No previous files</p>
            )}

            <Upload
              multiple
              beforeUpload={(file) => {
                setNewFiles((prev) => [...prev, file]);
                return false;
              }}
              fileList={newFiles}
              onRemove={(file) => {
                setNewFiles((prev) => prev.filter((f) => f !== file));
              }}
            >
              <Button icon={<UploadOutlined />}>Upload Files</Button>
            </Upload>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading}>
              Update
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
    </>

  );
};

export default ManageContent;
