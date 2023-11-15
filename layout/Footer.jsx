import Link from "next/link";
import React from "react";
import RCLogo from "../Components/RCLogo";
import { FaFacebook, FaInstagram } from "react-icons/fa";
import { FaXTwitter, FaLinkedin } from "react-icons/fa6";

export default function Footer() {
  const socials = [
    {
      icon: <FaFacebook />,
      href: "",
    },
    {
      icon: <FaInstagram />,
      href: "",
    },
    {
      icon: <FaXTwitter />,
      href: "",
    },
    {
      icon: <FaLinkedin />,
      href: "",
    },
  ];

  const otherLinks = {
    privacyPolicy: "",
    terms: "",
  };

  return (
    <footer className="rc-container-fluid">
      <div className="rc-container rc-footer">
        <div className="rc-footer-top">
          <Link href="/">
            <RCLogo />
          </Link>
          <div className="rc-footer-top-socials">
            {React.Children.toArray(
              socials.map((item) => <a href={item.href}>{item.icon}</a>)
            )}
          </div>
        </div>
        <i className="rc-divider" />
        <div className="rc-footer-bottom">
          <p className="credit">© 2023 AssetMantle. All rights reserved.</p>
          <a
            href={otherLinks.privacyPolicy}
            target="_blank"
            rel="noopener noreferrer"
          >
            Privacy Policy
          </a>
          <a href={otherLinks.terms} target="_blank" rel="noopener noreferrer">
            Terms of Service
          </a>
        </div>
      </div>
    </footer>
  );
}
