import { useState } from "react";
import Box from "@mui/material/Box";
import { useContext } from "react";
import styles from "./admin.module.scss";
import Layout from "../../../components/Layout";
import { GetServerSideProps } from "next";
import { ICollection } from "../../../types/collection.interface";
import ItemGrid from "../../../components/CollectionAdmin/ItemGrid";
import { CollectionDs } from "../../../ds";
import ContributorsGrid from "../../../components/CollectionAdmin/ContributorsGrid";
import Link from "next/link";
import withAuth from "../../../HOC/withAuth";
import { BiArrowBack } from "react-icons/bi";
import { BiRightArrowAlt } from "react-icons/bi";
import { FiChevronRight } from "react-icons/fi";
import { useRouter } from "next/router";
import DefaultAvatar from "../../../components/DefaultAvatar";
import { CollectionStatus } from "@prisma/client";
import NextImage from "../../../components/Image";
import CustomSelect from "../../../components/CustomSelect";
import { IItem } from "../../../types/item.interface";

// const CollectionAdmin = ({ collectionx }: { collectionx: ICollection }) => {

interface Properties {
  collection: ICollection;
}

const CollectionAdmin: React.FC<Properties> = ({ collection }) => {
  const [open, setOpen] = useState(1);
  const router = useRouter();
  const total = collection.items.reduce(
    (total: number, item: { price: number }) => total + item.price,
    0
  );
  console.log("collection", collection);
  return (
    <Layout>
      <Box className={styles.container}>
        <div className={styles.breadcrumbWrap}>
          <div onClick={() => router.push("/")} className={styles.backButton}>
            <BiArrowBack />
            <p className={styles.backText}>Back to collections</p>
          </div>
          <div className={styles.breadcrumb}>
            <span>Home</span>
            <span>&gt;</span>
            <span className={styles.currentCrumb}>Manage collection</span>
          </div>
        </div>
        <main>
          <div className={styles.heading}>
            <div className={styles.left}>
              <span> {collection?.status}</span>
              <h2>{collection?.title}</h2>
              <div>Launches in 10 Days 30 Minutes</div>
            </div>

            <div className={styles.right}>
              <button>Payount Funds</button>
              <Link href={`/collection/create?id=${collection?.id}`}>
                <button>
                  Edit Collection Details <BiRightArrowAlt />
                </button>
              </Link>
            </div>
          </div>
          <section className={styles.nav}>
            <span
              onClick={() => setOpen(1)}
              className={open === 1 ? styles.active : ""}
            >
              Items
            </span>

            <span
              onClick={() => setOpen(2)}
              className={open === 2 ? styles.active : ""}
            >
              Contributors
            </span>

            {/* <span onClick={() => setOpen(3)} className={open === 3 ? styles.active : ''}>Whitelist</span> */}

            <span
              onClick={() => setOpen(4)}
              className={open === 4 ? styles.active : ""}
            >
              Beneficiary
            </span>
          </section>
          {open === 1 && (
            <div>
              <section className={styles.stats}>
                <div>
                  <span>{collection?.items?.length}</span>
                  <h3>Collection Items</h3>
                </div>
                <div>
                  <span>{total} ETH</span>
                  <h3>Total worth of Collection </h3>
                </div>
                <div>
                  <span>200 ETH</span>
                  <h3>Revenue from Items</h3>
                </div>
              </section>
              <section>
                <h2></h2>
                <div className={styles.bottom}>
                  <div>
                    <ItemGrid
                      items={collection.items}
                      title="Manage Collection Items"
                    />
                  </div>
                </div>
              </section>
            </div>
          )}
          {open === 2 && (
            <div className={styles.section}>
              <h2>Manage Contributors</h2>
              <div className={styles.content}>
                {collection.contributors.map((contributor) => (
                  <div key={contributor.id} className={styles.row}>
                    <div className={styles.left}>
                      <DefaultAvatar
                        url={contributor.user.profile?.avatar}
                        width={"88px"}
                        height={"88px"}
                        walletAddress={contributor.user.walletAddress}
                        fontSize={"8px"}
                      />
                      <div className={styles.details}>
                        <div className={styles.dtop}>
                          <span className={styles.name}>
                            {contributor.user.email}
                          </span>
                          <span className={styles.number}>
                            10 Items in collection
                          </span>
                        </div>
                        <button>{contributor.confirmation}</button>
                      </div>
                    </div>
                    <div className={styles.center}>
                      <div className={styles.scroll}>
                        {collection.items
                          ?.filter(
                            (item) => item.ownerId === contributor.userId
                          )
                          .map((item: IItem, idx: number) => (
                            <div key={idx} className={styles.centerItem}>
                              <NextImage
                                className={styles.image}
                                src={item.images[0]}
                                width="112px"
                                height="88px"
                              />
                            </div>
                          ))}
                      </div>
                    </div>
                    <div className={styles.right}>
                      <label htmlFor="">PERCENTAGE</label>
                      <CustomSelect
                        placeholder="10%"
                        options={["10%", "30%", "50%"]}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {open === 3 && (
            <div className={styles.section}>
              <h2>Whitelist</h2>
            </div>
          )}
          {open === 4 && (
            <div className={styles.section}>
              <h2>Beneficiary</h2>
            </div>
          )}
        </main>
      </Box>
    </Layout>
  );
};
export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const { id }: any = ctx.params;
  let collection = await CollectionDs.getCollectionById(id);
  if (!collection) return { notFound: true };

  return {
    props: {
      collection: collection.data,
    },
  };
};
export default CollectionAdmin;
