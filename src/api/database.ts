import { db } from "../firestore";
import firebase from "firebase/app";
import { rejects } from "assert";
import { ids } from "webpack";

// export const createFile = (file: Object) => db.collection("files").add(file);
export const createFile = (file: Object) => {
  const files = db.collection("files");
  files
    .where("path", "==", file.path)
    .get()
    .then((snapshot) => {
      const size = snapshot.size;
      if (size > 0) {
        alert(`ファイルが既に存在するため追加されませんでした\n${file.path}`);
      } else {
        file.createDate = firebase.firestore.FieldValue.serverTimestamp();
        return db.collection("files").add(file);
      }
    });
};

export const fetchFiles = () =>
  db
    .collection("files")
    .get()
    .then((snapshot) =>
      snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
    )
    .then(async (fetchFiles) => {
      await Promise.all(
        fetchFiles.map(async (fetchFile) => {
          const relatedTagIds =
            fetchFile.relatedTags &&
            fetchFile.relatedTags.map((relatedTag) => relatedTag.id);
          if (relatedTagIds === undefined || !relatedTagIds.length) {
            return fetchFile;
          }
          // console.log(relatedTagIds);
          await fetchTagsByIds(relatedTagIds).then((fetchTagsByIds) => {
            // console.log(fetchTagsByIds);
            fetchFile.relatedTags = fetchTagsByIds;
          });
          // console.log(fetchFile.relatedTags);
          // console.log(fetchFile);
          // return fetchFile;
        })
      );
      // console.log(fetchFiles);
      return fetchFiles;
    });

export const subScribeToFiles = (onSubscribe: any) =>
  db.collection("files").onSnapshot((_) => onSubscribe());
export const deleteFile = (id: string) =>
  db.collection("files").doc(id).delete();

export const createTag = (tag: Object) => {
  const tags = db.collection("tags");
  tags
    .where("name", "==", tag.name)
    .get()
    .then((snapshot) => {
      const size = snapshot.size;
      if (size > 0) {
        alert("タグが既に存在します");
      } else {
        tag.createDate = firebase.firestore.FieldValue.serverTimestamp();
        return db.collection("tags").add(tag);
      }
    });
};
export const updateTag = (id: string, name: string) => {
  console.log(db.collection("tags").doc(id));
  db.collection("tags").doc(id).update({ name: name });
};
export const fetchTags = () =>
  db
    .collection("tags")
    .get()
    .then((snapshot) =>
      snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
    );
export const fetchTagsByIds = (ids: string[]) => {
  // console.log(ids);
  return db
    .collection("tags")
    .where(firebase.firestore.FieldPath.documentId(), "in", ids)
    .get()
    .then((snapshot) =>
      snapshot.docs.map((doc) => {
        // console.log(ids);
        // console.log(doc.data());
        return { id: doc.id, ...doc.data() };
      })
    );
};
export const subScribeToTags = (onSubscribe: any) =>
  db.collection("tags").onSnapshot((_) => onSubscribe());

export const deleteTag = (id: string) => {
  const tagRef = db.doc(`tags/${id}`);
  db.collection("files")
    .get()
    .then((snapshot) =>
      snapshot.forEach((doc) => {
        doc.ref.update({
          relatedTags: firebase.firestore.FieldValue.arrayRemove(tagRef),
        });
      })
    );
  tagRef.delete();
};

export const addTag = async (fileId: string, tagId: string) => {
  const fileRef = db.doc(`files/${fileId}`);
  const tagRef = db.doc(`tags/${tagId}`);
  await fileRef.update({
    relatedTags: firebase.firestore.FieldValue.arrayUnion(tagRef),
  });
  await tagRef.update({
    relatedFiles: firebase.firestore.FieldValue.arrayUnion(fileRef),
  });
};

export const deleteTagByFileIdTagId = async (fileId: string, tagId: string) => {
  const fileRef = db.doc(`files/${fileId}`);
  const tagRef = db.doc(`tags/${tagId}`);
  await fileRef.update({
    relatedTags: firebase.firestore.FieldValue.arrayRemove(tagRef),
  });
  await tagRef.update({
    relatedFiles: firebase.firestore.FieldValue.arrayRemove(fileRef),
  });
};
export const subScribeToChanges = (onSubscribe: any) =>
  db.collection("files").onSnapshot((snapshot) => onSubscribe(snapshot));
export const subScribeToTagChanges = (onSubscribe: any) =>
  db.collection("tags").onSnapshot((snapshot) => onSubscribe(snapshot));
