import React from 'react';
import {
  IPrebidAuctionEndEventData,
  IPrebidAdUnitMediaTypes,
  IPrebidAdUnit,
  IPrebidBidWonEventData,
  IPrebidBidResponseEventData,
} from '../../../../inject/scripts/prebid';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import ReactJson from 'react-json-view';
import Popover from '@mui/material/Popover';
import GavelOutlinedIcon from '@mui/icons-material/GavelOutlined';

const AdUnitChipComponent = ({ adUnit }: any): JSX.Element => {
  const [labelText, setLabelText] = React.useState<string | null>(adUnit.code);
  const scroll2element = (elementId: string): any => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const currentTab = tabs[0];
      const tabId = currentTab.id;
      const func = (elementId: string) => {
        const element = document.getElementById(elementId);
        const addBorder = (element: HTMLElement) => {
          const borderStyleBak = element.style.border;
          element?.scrollIntoView();
          element.style.border = '5px dashed #f99b0c';
          element.animate([{ transform: 'rotate(0deg)' }, { transform: 'rotate(360deg)' }], {
            duration: 1000,
            iterations: 1, // Infinity
          });
          window.setTimeout(() => {
            element.style.border = borderStyleBak;
          }, 5000);
        };
        if (!element) {
          return false;
        } else {
          addBorder(element);
          return true;
        }
      };
      chrome.scripting.executeScript({ target: { tabId }, func, args: [elementId] }, (injectionResults) => {
        if (injectionResults[0].result) {
          setLabelText(`✓ ${adUnit.code}`);
        } else {
          setLabelText(`✗ Element with id="${adUnit.code}" not found.`);
        }
        setTimeout(() => setLabelText(adUnit.code), 1500);
      });
    });
  };
  return (
    <Chip
      onClick={() => {
        scroll2element(adUnit.code);
      }}
      label={labelText}
      variant="outlined"
      sx={{ transition: 'all linear 0.25s' }}
    />
  );
};

const BidChipComponent = ({ input, label, isWinner, bidReceived }: any): JSX.Element => {
  const labelText = `${label}`;
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);
  const handlePopoverOpen = (event: React.MouseEvent<HTMLElement>) => {
    if (typeof input === 'object') {
      setAnchorEl(event.currentTarget);
    }
  };
  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  return (
    <React.Fragment>
      <Chip
        size="small"
        variant="outlined"
        color={isWinner ? 'secondary' : bidReceived ? 'primary' : 'default'}
        icon={isWinner ? <GavelOutlinedIcon sx={{ height: '12px', paddingLeft: 1 }} /> : null}
        label={labelText}
        onClick={handlePopoverOpen}
        sx={{ maxWidth: 200 }}
      />
      <Popover
        id="mouse-over-popover"
        open={open}
        anchorEl={anchorEl}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        onClose={handlePopoverClose}
        disableRestoreFocus
      >
        <ReactJson
          src={input}
          name={false}
          collapsed={false}
          enableClipboard={false}
          displayObjectSize={false}
          displayDataTypes={false}
          sortKeys={false}
          quotesOnKeys={false}
          indentWidth={2}
          collapseStringsAfterLength={100}
          style={{ fontSize: '12px', fontFamily: 'roboto', padding: '5px' }}
        />
      </Popover>
    </React.Fragment>
  );
};

const MediaTypeChipComponent = ({ input, label }: any): JSX.Element => {
  const labelText = `${label}: ${JSON.stringify(input)}`;
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);
  const handlePopoverOpen = (event: React.MouseEvent<HTMLElement>) => {
    if (typeof input === 'object') {
      setAnchorEl(event.currentTarget);
    }
  };
  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  return (
    <React.Fragment>
      <Chip size="small" variant="outlined" color="primary" label={labelText} onClick={handlePopoverOpen} sx={{ maxWidth: 200 }} />
      <Popover
        id="mouse-over-popover"
        open={open}
        anchorEl={anchorEl}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        onClose={handlePopoverClose}
        disableRestoreFocus
      >
        <ReactJson
          src={input}
          name={false}
          collapsed={false}
          enableClipboard={false}
          displayObjectSize={false}
          displayDataTypes={false}
          sortKeys={false}
          quotesOnKeys={false}
          indentWidth={2}
          collapseStringsAfterLength={100}
          style={{ fontSize: '12px', fontFamily: 'roboto', padding: '5px' }}
        />
      </Popover>
    </React.Fragment>
  );
};

const MediaTypesComponent = ({ mediaTypes }: IMediaTypesComponentProps): JSX.Element => {
  return (
    <Box>
      {Object.keys(mediaTypes).map((mediaType, index) => {
        switch (mediaType) {
          case 'banner': {
            return (
              <Box key={index}>
                <Typography variant="subtitle2">Banner Sizes:</Typography>
                <Stack direction="row" sx={{ flexWrap: 'wrap', gap: '5px' }}>
                  {mediaTypes[mediaType].sizes.map((size, index) => (
                    <Chip size="small" variant="outlined" color="primary" label={`${size[0]}x${size[1]}`} key={index} />
                  ))}
                </Stack>
              </Box>
            );
          }
          case 'video': {
            return (
              <Box key={index}>
                <Typography variant="subtitle2">Video:</Typography>
                <Stack direction="row" sx={{ flexWrap: 'wrap', gap: '5px' }}>
                  {Object.keys(mediaTypes[mediaType]).map((key, index) => (
                    <MediaTypeChipComponent input={mediaTypes[mediaType][key as keyof IPrebidAdUnitMediaTypes['video']]} label={key} key={index} />
                  ))}
                </Stack>
              </Box>
            );
          }
          case 'native': {
            return (
              <Box key={index}>
                <Typography variant="subtitle2">Native:</Typography>
                <Stack direction="row" sx={{ flexWrap: 'wrap', gap: '5px' }}>
                  {Object.keys(mediaTypes[mediaType]).map((key, index) => (
                    <MediaTypeChipComponent input={mediaTypes[mediaType][key as keyof IPrebidAdUnitMediaTypes['native']]} label={key} key={index} />
                  ))}
                </Stack>
              </Box>
            );
          }
        }
        return null;
      })}
    </Box>
  );
};

const SlotsComponent = ({ adUnits, latestAuctionsWinningBids, latestAuctionsBidsReceived }: ISlotsComponentProps): JSX.Element => {
  return (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell variant="head" sx={{ width: '33%' }}>
              Code
            </TableCell>
            <TableCell variant="head" sx={{ width: '33%' }}>
              Media Types
            </TableCell>
            <TableCell variant="head" sx={{ width: '34%' }}>
              Bidders
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {adUnits.map((adUnit, index) => {
            return (
              <TableRow key={index} sx={{ verticalAlign: 'top', '&:last-child td, &:last-child th': { border: 0 } }}>
                <TableCell variant="body">
                  <AdUnitChipComponent adUnit={adUnit} />
                </TableCell>
                <TableCell variant="body">
                  <MediaTypesComponent mediaTypes={adUnit.mediaTypes} />
                </TableCell>
                <TableCell variant="body">
                  <Stack direction="row" sx={{ flexWrap: 'wrap', gap: '5px' }}>
                    {adUnit.bids.map((bid, index) => {
                      const bidReceived = latestAuctionsBidsReceived.find(
                        (bidReceived) =>
                          bidReceived.args?.adUnitCode === adUnit.code &&
                          bidReceived.args.bidder === bid.bidder &&
                          adUnit.sizes?.map((size) => `${size[0]}x${size[1]}`).includes(bidReceived?.args?.size)
                      );
                      const isWinner = latestAuctionsWinningBids.some(
                        (winningBid) =>
                          winningBid.args.adUnitCode === adUnit.code &&
                          winningBid.args.bidder === bid.bidder &&
                          adUnit.sizes?.map((size) => `${size[0]}x${size[1]}`).includes(bidReceived?.args.size)
                      );
                      const label = bidReceived?.args.cpm
                        ? `${bid.bidder} (${bidReceived?.args.cpm.toFixed(2)} ${bidReceived?.args.currency})`
                        : `${bid.bidder}`;
                      return <BidChipComponent input={bid} label={label} key={index} isWinner={isWinner} bidReceived={bidReceived} />;
                    })}
                  </Stack>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

interface ISlotsComponentProps {
  auctionEndEvents: IPrebidAuctionEndEventData[];
  allBidderEvents: IPrebidBidResponseEventData[];
  latestAuctionsWinningBids: IPrebidBidWonEventData[];
  latestAuctionsBidsReceived: IPrebidBidWonEventData[];
  adUnits: IPrebidAdUnit[];
}

interface IMediaTypesComponentProps {
  mediaTypes: IPrebidAdUnitMediaTypes;
}

export default SlotsComponent;
