"use client";
import "./newsletter.scss";
import SubscribeNewsletter from "./subscribeNewsletter";
import Modal from "react-modal";
import { NextPage } from "next";
import Image from "next/image";
import CancelIcon from "@mui/icons-material/Cancel";
import { useEffect } from "react";
interface Props {
  onClose: () => void;
  isOpen: boolean;
}

const NewsletterPopup: NextPage<Props> = ({ onClose, isOpen }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);
  return (
    <div className="newsletterPopup-parent">
      <Modal
        isOpen={isOpen}
        onRequestClose={onClose}
        contentLabel="Newsletter Signup"
        ariaHideApp={false}
        className="modalContent"
        overlayClassName="modalOverlay"
      >
        <button type="button" onClick={onClose} className="modal-close-button">
          <CancelIcon />
        </button>
        <div className="modal-conatiner">
          <Image
            src="/newsletter1.jpg"
            width={350}
            height={300}
            alt="newsletter"
          />
          <div>
            <h2>Sign Up for our newsletter</h2>
            <p>
              Join our community and stay informed with the latest updates,
              insights, and trends directly in your inbox. Don't miss out—sign
              up today and be the first to know!
            </p>
            <SubscribeNewsletter />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default NewsletterPopup;
