import React from "react";
import styles from "./index.module.scss";
import SingleCollectibleItemForm from "../../../components/SingleItemForm";
import Layout from "../../../components/Layout";
// import { BiArrowBack } from "react-icons/bi";
import { useRouter } from "next/router";

const SingleCollectibleItem = () => {
  const router = useRouter();
  return (
    <Layout>
      {/* <div className={styles.breadcrumbWrap}>
        <div onClick={() => router.push("/")} className={styles.backButton}>
          <BiArrowBack />
          <p className={styles.backText}>Back to collection</p>
        </div>
        <div className={styles.breadcrumb}>
          <span>Profile</span>
          <span>&gt;</span>
          <span>Upload Item</span>
        </div>
      </div> */}
      <SingleCollectibleItemForm />
    </Layout>
  );
};

export default SingleCollectibleItem;