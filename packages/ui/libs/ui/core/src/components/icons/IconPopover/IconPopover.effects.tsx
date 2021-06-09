import React, { useCallback, useState } from 'react';

const mapTextWithLineBreaks = (popoverTextList: string[]) =>
  popoverTextList.map((text) => (
    <span key={text.length}>
      {text}
      <br />
      <br />
    </span>
  ));

export const useIconPopoverEffects = () => {
  const [anchorElRef, setAnchorElRef] = useState(null);
  const open = Boolean(anchorElRef);

  const handleClick = (event) => {
    if (event.currentTarget === anchorElRef) {
      setAnchorElRef(null);
    } else {
      setAnchorElRef(event.currentTarget);
    }
  };

  const handleClose = useCallback(() => {
    setAnchorElRef(null);
  }, []);
  const getClickableId = (open: boolean) =>
    open ? 'simple-popover' : undefined;

  const handlePopoverOpen = (event) => {
    setAnchorElRef(event.currentTarget);
  };

  const handlePopoverClose = () => {
    setAnchorElRef(null);
  };

  return {
    handleClose,
    handleClick,
    handlePopoverClose,
    handlePopoverOpen,
    mapTextWithLineBreaks,
    getClickableId,
    open,
    anchorElRef,
  };
};
