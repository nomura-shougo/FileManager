import React, { useState, useEffect } from "react";
const shell = window.electron.shell;
import {
  createFile,
  fetchFiles,
  subScribeToFiles,
  deleteFile,
  fetchTags,
  subScribeToTags,
  addTag,
  deleteTagByFileIdTagId,
} from "../api/database";
import { Modal, Button } from "react-bootstrap";
import Select from "react-select";
import { useForm, Controller, SubmitHandler } from "react-hook-form";

interface IFormInput {
  addTag: { label: string; value: string };
}
const orderOptions = [
  { value: "lastModifiedAsc", label: "最終更新日昇順" },
  { value: "lastModifiedDesc", label: "最終更新日降順" },
];

export default function FilesList({ filesprops, tagsprops }) {
  const [isCursorOn, setIsCursorOn] = useState(false);
  const [files, setFiles] = useState<Object[]>([]);
  const [filteredFiles, setFilteredFiles] = useState<Object[]>([]);
  const [relatedTagsList, setRelatedTagsList] = useState<Object[]>([]);
  const [tagOptions, setTagOptions] = useState<IFormInput[]>([]);
  const [addTagOptions, setAddTagOptions] = useState<IFormInput[]>([]);
  const [modalIsOpen, setIsOpen] = useState(false);
  const borderClasses = "border border-secondary rounded";
  const borderOnClasses = "border border-primary border-4 rounded";
  const { control, handleSubmit, reset } = useForm<IFormInput>();
  const [targetFile, setTargetFile] = useState<any>();
  const [searchYears, setSearchYears] = useState<any[]>([]);
  const [searchTags, setSearchTags] = useState<any[]>([]);
  const [fileOrder, setFileOrder] = useState<string>();
  const [data, setData] = useState<any>();

  // const options = [
  //   { value: "pikachu", label: "ピカチュウ" },
  //   { value: "bulbasaur", label: "フシギダネ" },
  //   { value: "charmander", label: "ヒトカゲ" },
  //   { value: "squirtle", label: "ゼニガメ" },
  // ];

  useEffect(() => {
    const initialize = () => {
      // subScribeToFiles(() => {
      //   fetchFiles().then(async (fetchFiles) => {
      //     setFiles(fetchFiles);
      // console.log(fetchFiles);
      // console.log(fetchFiles[0]);
      // await fetchFiles.forEach((fetchFile) => {
      //   const relatedTagIds =
      //     fetchFile.relatedTags &&
      //     fetchFile.relatedTags.map((relatedTag) => relatedTag.id);
      //   console.log(relatedTagIds);
      //   if (relatedTagIds !== undefined) {
      //     fetchTagsByIds(relatedTagIds).then((fetchTagsByIds) => {
      //       console.log(fetchTagsByIds);
      //       setRelatedTagsList(relatedTagsList.concat(fetchTagsByIds));
      //     });
      //   }
      // });

      // setFiles(fetchFiles);
      // console.log(fetchFiles);
      // console.log(
      //   await fetchFiles.map(async (fetchFile) => {
      //     console.log(fetchFile);
      //     const relatedTagIds =
      //       fetchFile.relatedTags &&
      //       fetchFile.relatedTags.map((relatedTag) => relatedTag.id);
      //     if (relatedTagIds === undefined) {
      //       console.log(fetchFile);
      //       return fetchFile;
      //     }
      //     console.log(relatedTagIds);
      //     await fetchTagsByIds(relatedTagIds).then((fetchTagsByIds) => {
      //       console.log(fetchTagsByIds);
      //       fetchFile.relatedTags = fetchTagsByIds;
      //     });
      //     console.log(fetchFile.relatedTags);
      //     return fetchFile;
      //   })
      // );
      // console.log(fetchFiles);
      // // setFiles(fetchFiles);
      // console.log(fetchFiles);
      // return fetchFiles;
      //   });
      // });
      // subScribeToTags(() => {
      //   fetchTags().then((fetchTags) => {
      //     const tagOptions = fetchTags.map((fetchTag) => {
      //       return { value: fetchTag.id, label: fetchTag.name };
      //     });
      //     setTagOptions(tagOptions);
      //   });
      // });
      // await fetchFiles().then((fetchFiles) => {
      //   setFiles(fetchFiles);
      // });
      const tagOptions = tagsprops.map((fetchTag) => {
        return { value: fetchTag.id, label: fetchTag.name };
      });
      setTagOptions(tagOptions);
      console.log(tagOptions);
      console.log(tagsprops);
    };
    initialize();
  }, []);
  useEffect(() => {
    // console.log(searchYears);
    const filtered = filesprops
      .map((file) => {
        if (file.relatedTags) {
          file.relatedTags = file.relatedTags.map((relatedTag) => {
            relatedTag.name =
              tagsprops[
                tagsprops.findIndex((tag) => tag.id === relatedTag.id)
              ].name;
            return relatedTag;
          });
        }
        return file;
      })
      .filter((file) => {
        if (!searchYears.length) {
          return true;
        } else {
          const year = getFiscalYear(new Date(file.lastModified));
          return searchYears.includes(year);
        }
      })
      .filter((file) => {
        if (!searchTags.length) {
          return true;
        } else {
          return searchTags.every(
            (searchTag) =>
              file.relatedTags &&
              file.relatedTags
                .map((relatedTag) => relatedTag.id)
                .includes(searchTag)
          );
        }
      });
    if (fileOrder === "lastModifiedAsc") {
      filtered.sort((a, b) => a.lastModified - b.lastModified);
    } else if (fileOrder === "lastModifiedDesc") {
      filtered.sort((a, b) => b.lastModified - a.lastModified);
    }
    // console.log(filtered);
    setFilteredFiles(filtered);
  }, [searchYears, searchTags, fileOrder, filesprops, tagsprops]);
  useEffect(() => {
    const tagOptions = tagsprops.map((fetchTag) => {
      return { value: fetchTag.id, label: fetchTag.name };
    });
    setTagOptions(tagOptions);
  }, [tagsprops]);

  const handleDragOver = (e: React.DragEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsCursorOn(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsCursorOn(false);
  };

  function formatDate(dt: Date) {
    const y = dt.getFullYear();
    const m = ("00" + (dt.getMonth() + 1)).slice(-2);
    const d = ("00" + dt.getDate()).slice(-2);
    return y + "-" + m + "-" + d;
  }
  const createYearOptions = () => {
    const yearOptions = [];
    const today = new Date();
    const y = today.getFullYear();
    const m = today.getMonth() + 1;
    const thisYear = m < 4 ? y - 1 : y;
    for (let i = 2011; i <= thisYear; i++) {
      yearOptions.push({
        value: i,
        label: String(i),
      });
    }
    return yearOptions;
  };
  const getFiscalYear = (targetDate: Date) => {
    const y = targetDate.getFullYear();
    const m = targetDate.getMonth() + 1;
    return m < 4 ? y - 1 : y;
  };
  const onSearchYearChange = (selectYears: any) => {
    // console.log(selectYears);
    // console.log(files);
    selectYears.map((searchYear: any) => {
      // console.log(searchYear);
      return searchYear.value;
    });
    setSearchYears(selectYears.map((searchYear: any) => searchYear.value));
  };
  const createAddTagOptions = (targetFile: Object) => {
    return tagOptions.filter((tagOption) => {
      return !(
        targetFile.relatedTags &&
        targetFile.relatedTags
          .map((relatedTag) => relatedTag.id)
          .includes(tagOption.value)
      );
    });
  };
  const onSearchTagChange = (selectTags: any) => {
    setSearchTags(selectTags.map((selectTag: any) => selectTag.value));
  };
  const onFileOrderChange = (selectOrder: any) => {
    let fileOrder;
    if (selectOrder === null) {
      fileOrder = "";
    } else {
      fileOrder = selectOrder.value;
    }
    setFileOrder(fileOrder);
  };
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.stopPropagation();
    e.preventDefault();
    setIsCursorOn(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 20) {
      alert("一度に追加するファイルの数は20以下にしてください");
      return;
    }
    for (let i = 0; i < files.length; i++) {
      const fileInfo = {
        path: files[i].path,
        lastModified: files[i].lastModified,
      };
      createFile(fileInfo);
    }
  };

  const handleTagDelete = (fileId: string, tagId: string) => {
    const result = confirm("タグを削除しますか？");
    if (result) {
      deleteTagByFileIdTagId(fileId, tagId);
    }
  };
  const handleFileDelete = (id: string) => {
    const result = confirm(
      "ファイル一覧からファイルを削除しますか？\n(ファイルの実体は削除されません)"
    );
    if (result) {
      deleteFile(id);
    }
  };
  const handleFileOpen = (path: string) => {
    const result = confirm(`ファイルを開きますか？\n${path}`);
    if (result) {
      shell.openPath(path).then((message: string) => {
        if (!!message) {
          alert(`ファイルパスが存在しません\n${path}`);
        }
      });
    }
  };

  const onSubmit: SubmitHandler<IFormInput> = (data) => {
    // console.log(data.addTag.value);
    // console.log(targetFile);
    let relatedTagsIdList = [];
    relatedTagsIdList =
      targetFile.relatedTags &&
      targetFile.relatedTags.map((relatedTag) => relatedTag.id);
    // console.log(relatedTagsIdList);
    if (relatedTagsIdList && relatedTagsIdList.includes(data.addTag.value)) {
      alert("選択したタグは登録済みです");
    } else {
      addTag(targetFile.id, data.addTag.value);
    }
  };
  // const onFileMouseOver = (index: number) => {
  //   console.log(index);
  //   setFiles((files) => {
  //     files[index].onHover = true;
  //     console.log(files)
  //     return files;
  //   });
  // };
  // const onFileMouseOut = (index: number) => {
  //   setFiles((files) => {
  //     files[index].onHover = false;
  //     console.log(files)
  //     return files;
  //   })
  // };
  return (
    <div
      className={
        "col-10 m-0 overflow-auto h-100 " +
        (isCursorOn ? borderOnClasses : borderClasses)
      }
      onDrop={handleDrop}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
    >
      <h6 className="mt-3">ファイル一覧</h6>
      ファイルをドロップしてください
      <div className="d-flex justify-content-start mb-3">
        年度：
        <div style={{ width: "250px" }}>
          <Select
            options={createYearOptions()}
            onChange={onSearchYearChange}
            isMulti
            autoBlur={false}
            closeMenuOnSelect={false}
          />
        </div>
        タグ：
        <div style={{ width: "250px" }}>
          <Select
            options={tagOptions}
            onChange={onSearchTagChange}
            isMulti
            autoBlur={false}
            closeMenuOnSelect={false}
          />
        </div>
        並び替え：
        <div style={{ width: "250px" }}>
          <Select
            options={orderOptions}
            onChange={onFileOrderChange}
            isClearable={true}
          />
        </div>
      </div>
      <table className="table table-striped table-bordered">
        <thead>
          <tr>
            <th scope="col" style={{ width: "200px" }}>
              パス
            </th>
            <th scope="col">タグ</th>
            <th scope="col">最終更新日</th>
            <th scope="col">削除</th>
          </tr>
        </thead>
        <tbody className="h-100">
          {filteredFiles.map((file, index) => (
            <tr key={index}>
              <td
                className="file-element"
                onClick={() => handleFileOpen(file.path)}
              >
                {file.path}
              </td>
              <td>
                <div className="d-flex justify-content-between">
                  <div>
                    {file.relatedTags &&
                      file.relatedTags.map((relatedTag, index) => (
                        <button
                          key={index}
                          className="bg-light small px-2 rounded border-0 me-2 mb-1"
                          onClick={() => {
                            handleTagDelete(file.id, relatedTag.id);
                          }}
                        >
                          {relatedTag.name}{" "}
                          <button
                            type="button"
                            className="btn-close small"
                            disabled
                            aria-label="Close"
                          />
                        </button>
                      ))}
                  </div>
                  <div className=" ms-auto">
                    <button
                      onClick={() => {
                        reset();
                        setIsOpen(true);
                        setAddTagOptions(createAddTagOptions(file));
                        setTargetFile(file);
                      }}
                      className="btn btn-primary"
                    >
                      追加
                    </button>
                  </div>
                </div>
              </td>
              <td>{formatDate(new Date(file.lastModified))}</td>
              <td>
                <button
                  className="btn btn-danger"
                  onClick={() => {
                    handleFileDelete(file.id);
                  }}
                >
                  削除
                </button>
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
            <label>タグを選択</label>
            {/* <Controller
                name="Select"
                control={control}
                render={(props) => <Select options={options} />} // props contains: onChange, onBlur and value
              /> */}
            <Controller
              name="addTag"
              control={control}
              defaultValue={addTagOptions[0]}
              render={({ field }) => (
                <Select {...field} options={addTagOptions} />
              )}
            />
            {/* <Controller
                name="iceCreamType"
                control={control}
                options={[
                  { value: "chocolate", label: "Chocolate" },
                  { value: "strawberry", label: "Strawberry" },
                  { value: "vanilla", label: "Vanilla" },
                ]}
                as={Select}
              /> */}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setIsOpen(false)}>
              閉じる
            </Button>
            <Button
              variant="primary"
              as="input"
              type="submit"
              value="追加する"
              onClick={() => setIsOpen(false)}
            />
          </Modal.Footer>
        </form>
      </Modal>
    </div>
  );
}
