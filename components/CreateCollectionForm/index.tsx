import React, { useRef, useState, useContext, useEffect } from "react";
import styles from "./index.module.scss";
import { useForm } from "react-hook-form";
import Image from "../Image";
import DefaultAvatar from "../DefaultAvatar";
import { IUser } from "../../types/user.interface";
import { toast } from "react-toastify";
import { IItem } from "../../types/item.interface";
import { RiVideoUploadLine } from "react-icons/ri";
import dynamic from "next/dynamic";
import { getFileUploadURL } from "../../utils/upload/fileUpload";
import { CollectionDs } from "../../ds";
import { AuthContext } from "../../contexts/AuthContext";
import { ICollection } from "../../types/collection.interface";
import { useRouter } from "next/router";
import userDs from "../../ds/user.ds";
import withAuth from "../../HOC/withAuth";
import { getUserName } from "../../utils/helpers/getUserName";
import itemDs from "../../ds/item.ds";

const ReactQuill: any = dynamic(() => import("react-quill"), { ssr: false });
const toolbarOptions = [
  ["bold", "italic", "underline", "strike"],
  ["blockquote", "code-block"],
  [{ header: 1 }, { header: 2 }],
  [{ list: "ordered" }, { list: "bullet" }],
  [{ script: "sub" }, { script: "super" }],
  [{ indent: "-1" }, { indent: "+1" }],
  [{ direction: "rtl" }],
  [{ header: [1, 2, 3, 4, 5, 6, false] }],
  [{ color: ["#353945"] }, { background: [] }],
  [{ font: [] }],
  [{ align: [] }],
  ["clean"],
];

const Index = ({ collection }: { collection: ICollection }) => {
  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    getValues,
    formState: { errors },
  } = useForm();
  const [desc, setDesc] = useState("");
  const [type, setType] = useState("");
  const [video, setVideo] = useState(null);
  const [searchUser, setSearchUser] = useState("");
  const [searchedUser, setSearchedUser] = useState<IUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<IUser[]>([]);
  const [resultDisplay, setResultDisplay] = useState(false);
  const [itemResultDisplay, setItemResultDisplay] = useState(false);
  const [items, setItems] = useState<any>([]);
  const [searchItem, setSearchItem] = useState("");
  const [selectedItems, setSelectedItems] = useState<IItem[]>([]);
  const [images, setImages] = useState({
    main: null,
    optional1: null,
    optional2: null,
    optional3: null,
    optional4: null,
  });
  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (user) {
      setSelectedUser([...selectedUser, user]);
    }
  }, [user]);
  useEffect(() => {
    if (collection) {
      setValue("title", collection.title);
      setValue("visible", collection.visible);
      setDesc(collection.description);
      const contributors = collection.contributors.map(
        (contributors) => contributors.user
      );
      setSelectedUser(contributors);
      setSelectedItems(collection.items);
    }
  }, [collection, setValue]);

  let queryCall = useRef<any>();

  useEffect(() => {
    clearTimeout(queryCall.current);

    const fetchData = async () => {
      const data = await userDs.fetchSearchedUsers(searchUser);
      setSearchedUser(data.searchedUsersWithoutPassword);
    };
    if (!searchUser) return;

    queryCall.current = setTimeout(() => {
      fetchData();
    }, 250);
  }, [searchUser]);

  useEffect(() => {
    if (selectedUser) {
      clearTimeout(queryCall.current);
      const userIds = selectedUser.map((user) => user.id);
      const fetchData = async () => {
        const data = await itemDs.searchUserItem(searchItem, userIds);
        setItems(data);
      };
      if (!searchItem) return;

      queryCall.current = setTimeout(() => {
        fetchData();
      }, 250);
    }
  }, [searchItem]);

  const router = useRouter();
  const targetVid = useRef<HTMLInputElement>(null);
  const target = useRef<HTMLInputElement>(null);
  const optional1 = useRef<HTMLInputElement>(null);
  const optional2 = useRef<HTMLInputElement>(null);
  const optional3 = useRef<HTMLInputElement>(null);
  const optional4 = useRef<HTMLInputElement>(null);

  const handleOptional1 = (e?: any) => {
    setImages({
      ...images,
      optional1: e.target.files[0],
    });
  };
  const handleOptional2 = (e?: any) => {
    setImages({
      ...images,
      optional2: e.target.files[0],
    });
  };
  const handleOptional3 = (e?: any) => {
    setImages({
      ...images,
      optional3: e.target.files[0],
    });
  };
  const handleOptional4 = (e?: any) => {
    setImages({
      ...images,
      optional4: e.target.files[0],
    });
  };

  const title = watch("title", "");
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    if (collection) {
      setLoading(true);
      await handleUpdateCollection();
      setLoading(false);
    } else {
      setLoading(true);

      if (!title || !desc || !type) {
        toast.error("Ensure required fields are not empty");
        setLoading(false);

        return;
      }
      await handleUpload();
      setLoading(false);
    }
  };
  const handleUpload = async () => {
    const data = getValues();
    data.description = desc;
    data.type = type;
    data.owners = selectedUser;
    data.items = selectedItems;

    const address: string = localStorage.getItem("address")!;

    try {
      const result = await CollectionDs.createData(data, user!, address);

      let imageArr = [];
      for (const image of Object.entries(images)) {
        if (image[1]) {
          imageArr.push({
            name: image[0],
            file: image[1],
          });
        }
      }

      let promise: any = [];
      imageArr.forEach((image) => {
        promise.push(
          getFileUploadURL(
            image.file,
            `collection/${result.data.id}/${image.name}`
          )
        );
      });

      let videoUrl = await getFileUploadURL(
        video,
        `/video/collection/${result.data.id}/${title.replace(" ", "-")}`
      );

      const imageURLs = await Promise.all(promise);
      await CollectionDs.updateData({
        id: result.data.id,
        images: imageURLs,
        videos: [videoUrl],
      });
      toast.success("collection created successful");
      reset();
      clearState();
      setTimeout(() => {
        router.push(`/collection/${result.data.id}`);
      }, 3000);
    } catch (error) {
      console.log(error);
      toast.error("error creating collection");
    }
  };

  const handleUpdateCollection = async () => {
    const data = getValues();
    data.description = desc;
    data.type = type;
    data.owners = selectedUser;
    data.items = selectedItems;
    data.id = collection.id;

    try {
      await CollectionDs.updateCollection(data);
      let imageArr = [];
      for (const image of Object.entries(images)) {
        if (image[1])
          imageArr.push({
            name: image[0],
            file: image[1],
          });
      }

      let promise: any = [];
      imageArr.forEach((image) => {
        promise.push(
          getFileUploadURL(
            image.file,
            `collection/${collection.id}/${image.name}`
          )
        );
      });

      let videoUrl;
      if (video) {
        videoUrl = await getFileUploadURL(
          video,
          `/video/collection/${collection.id}/${title.replace(" ", "-")}`
        );
      }

      let imageURLs = await Promise.all(promise);
      if (imageURLs.length) {
        await CollectionDs.updateData({
          id: collection.id,
          images: imageURLs,
        });
      }
      if (videoUrl) {
        await CollectionDs.updateData({
          id: collection.id,
          videos: [videoUrl],
        });
      }
      toast.success("collection updated successful");
      setTimeout(() => {
        router.push("/collection/" + collection.id);
      }, 2000);
    } catch (error) {
      console.log(error);
    }
  };

  const handleVideoChange = async (event: any) => {
    const file = event.target.files[0];
    const MAX_FILE_SIZE = 5120; // 5MB

    if (file.size / 1024 > MAX_FILE_SIZE) {
      toast.warning("uploaded video file is too big");
      return;
    }
    setVideo(file);
  };
  const handleChangeRequired = (e?: any, name?: any) => {
    setImages({
      ...images,
      main: e.target.files[0],
    });
  };
  const clearState = () => {
    setDesc("");
    setVideo(null);
    setImages({
      main: null,
      optional1: null,
      optional2: null,
      optional3: null,
      optional4: null,
    });
    reset();
    setSelectedItems([]);
    setSelectedUser([]);
  };
  return (
    <div className={styles.root}>
      <div className={styles.sciCon}>
        <div className={styles.sci}>
          <div className={styles.scihead}>
            {collection ? (
              <h1>Edit collection</h1>
            ) : (
              <h1>Create new collection</h1>
            )}
          </div>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className={styles.itemdetailsformcon}
          >
            <div className={styles.uploadsechead}>
              <h4 className={styles.upload}>Upload Video </h4>
              <span className={styles.drag}>
                Drag or choose your file to upload
              </span>
            </div>
            {!video ? (
              <div
                onClick={() => targetVid.current?.click()}
                className={styles.sciuploadvideobox}
              >
                <RiVideoUploadLine size={50} color="#777E91" />
                <p>WEBM or MP4.</p>
              </div>
            ) : (
              <video controls>
                <source src={URL.createObjectURL(video)} />
              </video>
            )}
            <input
              style={{
                display: "none",
                backgroundColor: "#f2994a",
                width: "200px",
                color: "#fff",
              }}
              ref={targetVid}
              type="file"
              accept="video/*"
              onChange={(event) => {
                handleVideoChange(event);
              }}
            />
            <div className={styles.sciuploadseccon}>
              <div className={styles.uploadsechead}>
                <span className={styles.upload}>Upload image (required)</span>
                <span className={styles.drag}>
                  Drag or choose your file to upload
                </span>
              </div>
              <div
                onClick={() => target.current?.click()}
                className={styles.sciuploadbox}
              >
                <Image
                  width="50px"
                  height="50px"
                  alt="upload icon"
                  src={`/assets/uploadicon.svg`}
                />
                <p>PNG, GIF, WEBP, MP4 or MP3. Max 1Gb.</p>
              </div>
              <input
                style={{ display: "none" }}
                type="file"
                ref={target}
                onChange={(e) => handleChangeRequired(e, "main")}
              />
            </div>
            <div className={styles.sciuploadseccon}>
              <div className={styles.uploadsechead}>
                <span className={styles.upload}>
                  Additional Images (optional)
                </span>
              </div>
              <section className={styles.additional}>
                <div
                  onClick={() => optional1.current?.click()}
                  className={images.optional1 ? styles.img : styles.optional}
                >
                  {images.optional1 ? (
                    <Image
                      width={600}
                      height={500}
                      alt="item optional 1"
                      src={URL.createObjectURL(images.optional1)}
                    />
                  ) : (
                    <Image
                      width={20}
                      height={20}
                      alt="upload icon"
                      src={`/assets/uploadicon.svg`}
                    />
                  )}
                  <input
                    style={{ display: "none" }}
                    type="file"
                    ref={optional1}
                    onChange={(e) => handleOptional1(e)}
                  />
                </div>
                <div
                  onClick={() => optional2.current?.click()}
                  className={images.optional2 ? styles.img : styles.optional}
                >
                  {images.optional2 ? (
                    <Image
                      width={600}
                      height={500}
                      alt="item optional 2"
                      src={URL.createObjectURL(images.optional2)}
                    />
                  ) : (
                    <Image
                      width={20}
                      height={20}
                      alt="upload icon"
                      src={`/assets/uploadicon.svg`}
                    />
                  )}
                  <input
                    style={{ display: "none" }}
                    type="file"
                    ref={optional2}
                    onChange={(e) => handleOptional2(e)}
                  />
                </div>
                <div
                  onClick={() => optional3.current?.click()}
                  className={images.optional3 ? styles.img : styles.optional}
                >
                  {images.optional3 ? (
                    <Image
                      width={600}
                      height={500}
                      alt="item optional 1"
                      src={URL.createObjectURL(images.optional3)}
                    />
                  ) : (
                    <Image
                      width={20}
                      height={20}
                      alt="upload icon"
                      src={`/assets/uploadicon.svg`}
                    />
                  )}
                  <input
                    style={{ display: "none" }}
                    type="file"
                    ref={optional3}
                    onChange={(e) => handleOptional3(e)}
                  />
                </div>
                <div
                  onClick={() => optional4.current?.click()}
                  className={images.optional4 ? styles.img : styles.optional}
                >
                  {images.optional4 ? (
                    <Image
                      width={600}
                      height={500}
                      alt="item optional 1"
                      src={URL.createObjectURL(images.optional4)}
                    />
                  ) : (
                    <Image
                      width={20}
                      height={20}
                      alt="upload icon"
                      src={`/assets/uploadicon.svg`}
                    />
                  )}
                  <input
                    style={{ display: "none" }}
                    type="file"
                    ref={optional4}
                    onChange={(e) => handleOptional4(e)}
                  />
                </div>
              </section>
            </div>
            <div className={styles.itemdetailsforminput}>
              <h4>Collection Details</h4>
              <label>COLLECTION NAME</label>
              <input
                type="text"
                disabled={!!collection}
                placeholder='e. g. "Redeemable Bitcoin Card with logo"'
                {...register("title", { required: true })}
              />
              {errors.title && <span>This field is required</span>}
            </div>

            <div className={styles.editor}>
              <label>DESCRIPTION</label>

              <div className={styles.editor}>
                <ReactQuill
                  modules={{
                    toolbar: toolbarOptions,
                  }}
                  theme="snow"
                  style={{
                    height: "16rem",
                  }}
                  placeholder='e.g. “After purchasing you will able to receive the logo...”"'
                  value={desc}
                  onChange={(e: any) => {
                    setDesc(e);
                  }}
                />
              </div>
            </div>
            <div className={styles.itemdetailsforminput}>
              <label>COLLECTION TYPE</label>
              <select
                onChange={(e: any) => setType(e.target.value)}
                disabled={!!collection}
                value={type}
              >
                <option value="" disabled hidden>
                  Choose a Collection type
                </option>
                <option value="ORDINARY">Ordinary</option>
                <option value="COLLABORATORS">Collaborators</option>
                <option value="FUNDRAISING">Fund Raising</option>
                <option value="LOCKSHARED">Lock Shared</option>
              </select>
            </div>
            <div className={styles.itemdetailformdropdownsCon}>
              <div className={styles.itemdetailsformdropdown}>
                <label>COUNT DOWN FROM</label>
                <input
                  type="text"
                  placeholder="12-03-2022"
                  onFocus={(e) => (e.target.type = "date")}
                  {...register("countdown", {})}
                />
              </div>
            </div>
            <div className={styles.divider}></div>
            <div className={styles.itemdetailsforminputSearch}>
              <label>SEARCH TO SELECT CONTRIBUTORS</label>
              <input
                type="text"
                name="Search"
                placeholder="Search users"
                value={searchUser}
                onChange={(e) => {
                  setResultDisplay(true);
                  setSearchUser(e.target.value);
                }}
              />
              <div
                style={{ display: `${resultDisplay ? "flex" : "none"}` }}
                className={styles.searchResults}
              >
                {searchUser &&
                  searchedUser
                    ?.filter((userS) => userS.id !== user?.id)
                    .map((user, index) => (
                      <span
                        key={index}
                        onClick={() => {
                          const userItems: IItem[] = user.items!;
                          for (let i = 0; i < selectedUser.length; i++) {
                            if (
                              selectedUser[i].walletAddress ===
                              user.walletAddress
                            ) {
                              toast.warning("User already selected");
                              return;
                            }
                          }
                          setSelectedUser([...selectedUser, user]);
                          // setItems([...items, ...userItems]);
                          setSearchUser("");
                          setResultDisplay(false);
                        }}
                      >
                        {user.email && user.email}
                      </span>
                    ))}
              </div>
              <div className={styles.itemImagesDiv}>
                {selectedUser.map((selUser, index) => (
                  <div key={index} className={styles.userImage}>
                    <div
                      className={styles.closeIcon}
                      onClick={() =>
                        setSelectedUser([
                          ...selectedUser.slice(0, index),
                          ...selectedUser.slice(index + 1, selectedUser.length),
                        ])
                      }
                      style={{
                        display: selUser.id === user?.id ? "none" : "block",
                      }}
                    >
                      <Image
                        width="30px"
                        height="30px"
                        alt="close icon"
                        src={`/assets/closeicon.svg`}
                      />
                    </div>
                    <DefaultAvatar
                      fontSize=".6rem"
                      id={user!.id}
                      url={user?.profile?.avatar}
                      walletAddress={selUser.walletAddress}
                      width="56px"
                      height="56px"
                    />
                  </div>
                ))}
              </div>
            </div>
            <div className={styles.itemdetailsforminputSearch}>
              <label>SELECT ITEMS FROM GALLERY</label>
              <input
                type="text"
                name="Search"
                placeholder="Search items"
                disabled={!selectedUser.length}
                value={searchItem}
                onChange={(e) => {
                  setItemResultDisplay(true);
                  setSearchItem(e.target.value);
                }}
              />
              <div
                style={{ display: `${itemResultDisplay ? "flex" : "none"}` }}
                className={styles.searchResults}
              >
                {searchItem &&
                  items &&
                  items.map((item: any, index: number) => (
                    <span
                      key={index}
                      onClick={() => {
                        for (let i = 0; i < selectedItems.length; i++) {
                          if (selectedItems[i].title === item.title) {
                            toast.warning("Item already selected");
                            return;
                          }
                        }
                        setSelectedItems([...selectedItems, item]);
                        setSearchItem("");
                        setItemResultDisplay(false);
                      }}
                    >
                      {item.title && item.title}
                    </span>
                  ))}
              </div>
              <div className={styles.itemImagesDiv}>
                {selectedItems.map((item, index) => (
                  <div key={index} className={styles.userImage}>
                    <div
                      className={styles.closeIcon}
                      onClick={() =>
                        setSelectedItems([
                          ...selectedItems.slice(0, index),
                          ...selectedItems.slice(
                            index + 1,
                            selectedItems.length
                          ),
                        ])
                      }
                    >
                      <Image
                        width="30px"
                        height="30px"
                        alt="close icon"
                        src={`/assets/closeicon.svg`}
                      />
                    </div>
                    <Image
                      src={item.images[0]}
                      width="112px"
                      height="88px"
                      alt=""
                    />
                  </div>
                ))}
              </div>
            </div>
            <div className={styles.putonscalebtnsec}>
              {collection ? (
                <button type="submit">
                  Update collection
                  <span>
                    <Image
                      width="20px"
                      height="10px"
                      src={`/assets/arrow.svg`}
                      alt=""
                    />
                  </span>
                </button>
              ) : (
                <button type="submit" disabled={loading}>
                  Create collection
                  <span>
                    <Image
                      width="20px"
                      height="20px"
                      className={loading ? styles.spinner : ""}
                      src={
                        loading
                          ? `/assets/singleItem/spinner.svg`
                          : `/assets/arrow.svg`
                      }
                      alt=""
                    />
                  </span>
                </button>
              )}
            </div>
          </form>
        </div>
        <div className={styles.previewCard}>
          <div className={styles.previewheading}>
            <h1>Preview</h1>
          </div>
          <div className={styles.previewContent}>
            <div className={styles.collectionsPreview}>
              <div className={styles.mainImgdiv}>
                <Image
                  className={styles.mainImg}
                  src={
                    images.main
                      ? URL.createObjectURL(images.main)
                      : collection?.images[0] || `/assets/placeholder-image.jpg`
                  }
                  layout="fill"
                  alt=""
                />
              </div>
              <div className={styles.imagesDiv}>
                <div className={styles.images}>
                  <Image
                    className={styles.subImg}
                    src={
                      images.optional1
                        ? URL.createObjectURL(images.optional1)
                        : collection
                        ? collection?.images[1]
                        : `/assets/placeholder-image.jpg`
                    }
                    layout="fill"
                    alt=""
                  />
                </div>
                <div className={styles.images}>
                  <Image
                    className={styles.subImg}
                    src={
                      images.optional2
                        ? URL.createObjectURL(images.optional2)
                        : collection
                        ? collection?.images[2]
                        : `/assets/placeholder-image.jpg`
                    }
                    layout="fill"
                    alt=""
                  />
                </div>
                <div className={styles.images}>
                  <Image
                    className={styles.subImg}
                    src={
                      images.optional3
                        ? URL.createObjectURL(images.optional3)
                        : collection?.images[3] ||
                          `/assets/placeholder-image.jpg`
                    }
                    layout="fill"
                    alt=""
                  />
                </div>
              </div>
              <div className={styles.infoDiv}>
                <h4>{(title && title) || "Amazing Digital Art"}</h4>
                <div className={styles.bottom}>
                  <div className={styles.left}>
                    <Image
                      className={styles.image}
                      src={
                        collection?.author?.profile?.avatar ||
                        `/assets/avatar.png`
                      }
                      width="50px"
                      height="50px"
                      alt=""
                    />

                    <div className={styles.owner}>
                      {getUserName(collection?.author)}
                    </div>
                  </div>
                  <span>{selectedItems && selectedItems.length} Items</span>
                </div>
              </div>
              <div className={styles.clearsec} onClick={() => clearState()}>
                <Image
                  width="20px"
                  height="20px"
                  alt="close icon"
                  src={`/assets/closeicon.svg`}
                />
                <span>Clear all</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
