import React, { useState, useEffect } from "react";
import firebase from "firebase/app";
import FilesList from "../components/FilesList";
import TagsList from "../components/TagsList";
import SideBar from "../components/SideBar";
import Header from "../components/Header";
import { db } from "../firestore";
import { HashRouter as Router, Switch, Route } from "react-router-dom";
import {
  fetchTagsByIds,
  subScribeToChanges,
  subScribeToTagChanges,
} from "../api/database";
export default function HomeView() {
  const [files, setFiles] = useState<Object[]>([]);
  const [tags, setTags] = useState<Object[]>([]);
  useEffect(() => {
    const initialize = () => {
      // subScribeToChanges(
      //   (
      //     snapshot: firebase.firestore.QuerySnapshot<firebase.firestore.DocumentData>
      //   ) => {
      //     setFiles((files) => {
      //       snapshot.docChanges().forEach(async (change) => {
      //         // 追加時
      //         if (change.type === "added") {
      //           console.log("add");
      //           await getFileWithTag({
      //             id: change.doc.id,
      //             ...change.doc.data(),
      //           }).then((addedFile) => files.push(addedFile));
      //         }
      //         // 修正（更新時）
      //         if (change.type === "modified") {
      //           // console.log("modified");
      //           const filtered = files.filter(
      //             (file) => file.id !== change.doc.id
      //           );
      //           await getFileWithTag({
      //             id: change.doc.id,
      //             ...change.doc.data(),
      //           }).then((modifiedFile) => {
      //             files = [...filtered, modifiedFile];
      //             // console.log(files);
      //           });
      //         }
      //         // 完全削除時
      //         if (change.type === "removed") {
      //           // console.log("removed" + change.doc.id);
      //           const filtered = files.filter(
      //             (file) => file.id !== change.doc.id
      //           );
      //           files = filtered;
      //         }
      //         setFiles(files);
      //         console.log(files);
      //       });
      //       return [];
      //     });
      //   }
      // );
      // subScribeToTagChanges(
      //   (
      //     snapshot: firebase.firestore.QuerySnapshot<firebase.firestore.DocumentData>
      //   ) => {
      //     setTags((tags) => {
      //       snapshot.docChanges().forEach((change) => {
      //         // 追加時
      //         if (change.type === "added") {
      //           console.log("add");
      //           tags.push({
      //             id: change.doc.id,
      //             ...change.doc.data(),
      //           });
      //         }
      //         // 修正（更新時）
      //         if (change.type === "modified") {
      //           console.log("modified");
      //           const filtered = tags.filter((tag) => tag.id !== change.doc.id);
      //           tags = [
      //             ...filtered,
      //             {
      //               id: change.doc.id,
      //               ...change.doc.data(),
      //             },
      //           ];
      //         }
      //         // 完全削除時
      //         if (change.type === "removed") {
      //           console.log("removed" + change.doc.id);
      //           const filtered = tags.filter((tag) => tag.id !== change.doc.id);
      //           tags = filtered;
      //         }
      //       });
      //       console.log(tags);
      //       return tags;
      //     });
      //   }
      // );
      db.collection("files").orderBy("createDate", "desc").onSnapshot((snapshot) => {
        const fetchFiles = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        const fetchFilesWithTags = async (
          fetchFiles: {
            id: string;
          }[]
        ) => {
          await Promise.all(
            fetchFiles.map(async (fetchFile) => {
              const relatedTagIds =
                fetchFile.relatedTags &&
                fetchFile.relatedTags.map((relatedTag) => relatedTag.id);
              if (relatedTagIds === undefined || !relatedTagIds.length) {
                return fetchFile;
              }
              await fetchTagsByIds(relatedTagIds).then((fetchTagsByIds) => {
                fetchFile.relatedTags = fetchTagsByIds;
              });
            })
          );
          return fetchFiles;
        };
        fetchFilesWithTags(fetchFiles).then((files) => setFiles(files));
      });
      db.collection("tags").orderBy("createDate").onSnapshot((snapshot) =>
        setTags(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })))
      );
    };
    initialize();
  }, []);
  useEffect(() => {
  
  }, [files, tags]);
  const getFileWithTag = async (file: any) => {
    const relatedTagIds =
      file.relatedTags &&
      file.relatedTags.map((relatedTag: any) => relatedTag.id);
    if (relatedTagIds === undefined || !relatedTagIds.length) {
      return file;
    }
    await fetchTagsByIds(relatedTagIds).then((fetchTagsByIds) => {
      file.relatedTags = fetchTagsByIds;
    });
    // console.log(file);
    return file;
  };

  return (
    <Router>
      <div className="d-flex flex-column vh-100">
        <Header />

        <div className="row m-0 flex-fill overflow-auto">
          <SideBar />
          <Switch>
            <Route path="/" exact>
              <FilesList filesprops={files} tagsprops={tags} />
            </Route>
            <Route path="/tags">
              <TagsList tagsprops={tags} />
            </Route>
          </Switch>
        </div>
      </div>
    </Router>
  );
}
