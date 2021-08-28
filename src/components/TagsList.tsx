import React, { useState, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import {
  createTag,
  fetchTags,
  subScribeToTags,
  updateTag,
  deleteTag,
} from "../api/database";

interface IFormInput {
  id: string;
  tagName: string;
}

export default function tagsList({ tagsprops }) {
  const [modalIsOpen, setIsOpen] = useState(false);
  const [modalEditIsOpen, setEditIsOpen] = useState(false);
  const [targetTagName, setTargetTagName] = useState("");
  const { register, handleSubmit, reset, setValue } = useForm<IFormInput>();
  const [tags, setTags] = useState<Object[]>([]);
  // useEffect(() => {
  //   const initialize = () => {
  //     subScribeToTags(() => {
  //       fetchTags().then((fetchTags) => {
  //         setTags(fetchTags);
  //         // console.log(fetchTags);
  //       });
  //     });
  //   };
  //   initialize();
  // }, []);
  useEffect(() => {
    setTags(tagsprops);
    // console.log(tagsprops);
  }, []);
  useEffect(() => {
    setTags(tagsprops);
    console.log(tagsprops);
  }, [tagsprops]);

  const onSubmit: SubmitHandler<IFormInput> = (data) => {
    // console.log(data);
    createTag({ name: data.tagName });
    reset();
  };
  // const onDelete: SubmitHandler<IFormInput> = (data) => {
  //   const result = confirm("タグを削除しますか？");
  //   if (result) {
  //     console.log(data.id);
  //     deleteTag(data.id);
  //   }
  // };
  const onDelete = (id: string) => {
    const result = confirm("タグを削除しますか？");
    if (result) {
      deleteTag(id);
    }
  };
  const onEditSubmit: SubmitHandler<IFormInput> = (data) => {
    console.log(data);
    updateTag(data.id, data.tagName);
    // createTag({ name: data.tagName });
    // reset();
  };
  return (
    <div className={"col-10 m-0 overflow-auto h-100"}>
      タグ一覧
      <div className="d-flex justify-content-end mb-2">
        <button
          className="btn btn-outline-danger"
          onClick={() => {
            setValue("tagName", "");
            setIsOpen(true);
          }}
        >
          タグを追加する
        </button>
      </div>
      <table className="table table-striped table-bordered">
        <thead>
          <tr>
            <th scope="col">タグ</th>
          </tr>
        </thead>
        <tbody className="h-100">
          {tags.map((tag, index) => (
            <tr key={index}>
              <td className="d-flex justify-content-between">
                <div>{tag.name}</div>
                {/* <form onSubmit={handleSubmit(onDelete)} className="form">
                  <input hidden value={tag.id} {...register("id")} />
                  {tag.name}
                  {tag.id}
                  <Button
                    variant="danger"
                    as="input"
                    type="submit"
                    value="削除"
                  />
                </form> */}
                <div>
                  <button
                    className="btn btn-primary me-2"
                    onClick={() => {
                      setValue("id", tag.id);
                      setValue("tagName", tag.name);
                      setEditIsOpen(true);
                    }}
                  >
                    編集
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={() => {
                      onDelete(tag.id);
                    }}
                  >
                    削除
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <Modal
        show={modalIsOpen}
        onHide={() => setIsOpen(false)}
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <form onSubmit={handleSubmit(onSubmit)} className="form">
          <Modal.Header closeButton>
            <Modal.Title id="contained-modal-title-vcenter">
              タグを追加する
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <label className="form-label">タグの名前</label>
            <input
              type="text"
              className="form-control"
              {...register("tagName")}
            />
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setIsOpen(false)}>
              閉じる
            </Button>
            <Button
              variant="primary"
              as="input"
              type="submit"
              value="登録する"
              onClick={() => setIsOpen(false)}
            />
          </Modal.Footer>
        </form>
      </Modal>
      <Modal
        show={modalEditIsOpen}
        onHide={() => setEditIsOpen(false)}
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <form onSubmit={handleSubmit(onEditSubmit)} className="form">
          <Modal.Header closeButton>
            <Modal.Title id="contained-modal-title-vcenter">
              タグを編集する
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <label className="form-label">タグの名前</label>
            <input
              type="text"
              className="form-control"
              {...register("tagName")}
            />
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setEditIsOpen(false)}>
              閉じる
            </Button>
            <Button
              variant="primary"
              as="input"
              type="submit"
              value="変更する"
              onClick={() => setEditIsOpen(false)}
            />
          </Modal.Footer>
        </form>
      </Modal>
    </div>
  );
}
