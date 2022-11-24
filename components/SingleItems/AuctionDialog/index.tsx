import { useState, useContext } from "react";
import { useRouter } from "next/router";
import Dialog from "../../global/Dialog/Dialog";
import styles from "./index.module.scss";
import { AuctionDs } from "../../../ds";
import { toast } from "react-toastify";
import { useSWRConfig } from "swr";

export default function Index({ open, handleClose, item, edit }: any) {
  const [startPrice, setStartPrice] = useState(item?.auction?.openPrice);
  const [startTime, setStartTime] = useState<null | string>(
    item?.auction?.startTime
  );
  const [endTime, setEndTime] = useState<null | string>(item?.auction?.endTime);
  const { mutate } = useSWRConfig();

  const handleSubmit = async () => {
    if (edit) {
      // TODO ONCHAIN INTERACTION

      handleClose();
      toast.success("Auction updated");
      try {
        await AuctionDs.updateData({
          id: item.auction.id,
          startPrice,
          startTime,
          endTime,
        });
        mutate("item" + item.id);
      } catch (error) {
        toast.error("Error updating auction");
      }
    } else {
      // TODO ONCHAIN INTERACTION

      const newData = { ...item, auction: { open: true } };
      mutate("item" + item.id, () => newData, false);
      handleClose();
      toast.success("placed on auction");

      try {
        await AuctionDs.postData({
          itemId: item.id,
          startPrice,
          startTime,
          endTime,
        });
        mutate(["item", item.id]);

        setTimeout(() => {}, 2000);
      } catch (error) {
        toast.error("error placing auction");
      }
    }
  };
  const handleChange = (e: any) => {
    const value = Number(e.target.value);
    setStartPrice(value);
  };

  return (
    <>
      <Dialog
        open={open}
        handleClose={handleClose}
        title={edit ? "edit auction" : "place on auction"}
      >
        <main className={styles.main}>
          <p>
            You are about to place <strong>{item.title} </strong>
            on action
          </p>

          <section>
            <div>
              <span>Starting Price </span>
              <div className={styles.bidinput}>
                <section className={styles.auctionAmount}>
                  <strong>
                    <input
                      type="number"
                      value={startPrice}
                      placeholder="Enter amount"
                      onChange={handleChange}
                    />
                    ETH
                  </strong>
                </section>
              </div>
            </div>
            <div>
              <span>Start Date</span>
              <input
                type="datetime-local"
                value={startTime || ""}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
            <div>
              <span>End Time</span>
              <input
                type="datetime-local"
                value={endTime || ""}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
          </section>
          <section className={styles.button}>
            <button
              className={styles.accept}
              disabled={startPrice <= 0 || startTime == null || endTime == null}
              onClick={handleSubmit}
            >
              {edit ? "Edit Auction" : "Place on Action"}
            </button>
            <button onClick={handleClose}>Cancel</button>
          </section>
        </main>
      </Dialog>
    </>
  );
}
