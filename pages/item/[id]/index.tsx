import { GetServerSideProps } from "next";
import React, { useEffect, useState } from "react";
import NextImage from "../../../components/Image";
import Layout from "../../../components/Layout";
import QuickButtons from "../../../components/SingleItems/QuickButtons";
import Tags from "../../../components/SingleItems/Tags";
import { ItemDs } from "../../../ds";
import useWindowSize from "../../../hooks/useWindowSize";
import { IItem } from "../../../types/item.interface";
import styles from "./index.module.scss";

const Index = (item: IItem) => {
  const width = useWindowSize().width!;
  const [id, setId] = useState<null | number>(null);
  useEffect(() => {
    const id = parseInt(localStorage.getItem("id") || "");
    id && setId(id);
  }, []);
  const isComingSoon = item?.openForBid;

  const isOwner = item.owner.id === id;

  return (
    <Layout>
      <main className={styles.main}>
        <section className={styles.sectionone}>
          <div className={styles.tags}>
            {/* TODO: change to item category */}
            <span>ART</span>
            {isComingSoon && <span>coming soon</span>}
          </div>

          <div className={styles.img}>
            {item?.images[0] && (
              <NextImage alt={item.title} src={item.images[0]} layout="fill" />
            )}
            {width < 800 && <QuickButtons />}
          </div>
        </section>
        <section className={styles.sectiontwo}>
          <div className={styles.price}>
            <h3>{item.title}</h3>
            <span>{item.price} ETH</span>
            {/* <span>$4,429.87</span> */}
          </div>
          <div className={styles.stats}>
            <div>
              <span>Likes</span>
              <span>{item?.ratings?.length || 0}</span>
            </div>
            <div>
              <span>Offers</span>
              <span>{item?.bids?.length || 0}</span>
            </div>
            {/* <div>
              <span>Views</span>
              <span>2345</span>
            </div> */}
            <div>
              <span>Rating</span>
              <span>{item?.ratings?.length || 0}</span>
            </div>
          </div>
          <p>{item.description}</p>
          <Tags isOwner={isOwner} owner={item.owner} />
          {width > 800 && <QuickButtons desktop={true} />}
        </section>
      </main>
    </Layout>
  );
};

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const itemId = ctx.params?.id;
  let [Item] = await Promise.all([ItemDs.getData()]);
  let item = Item.find((i: any) => i.id == Number(itemId));
  console.log(item);

  if (!item) {
    return {
      notFound: true,
    };
  }
  return {
    props: {
      item,
    },
  };
};

export default Index;
