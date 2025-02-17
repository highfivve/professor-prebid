import React, { useEffect } from 'react';
import {
  IPrebidAuctionInitEventData,
  IPrebidDetails,
  IPrebidNoBidEventData,
  IPrebidBidResponseEventData,
  IPrebidAuctionEndEventData,
  IPrebidAdUnit,
} from '../../../../inject/scripts/prebid';
import SlotsComponent from './SlotsComponent';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import logger from '../../../../logger';
import merge from 'lodash/merge';

const AdUnitsComponent = ({ prebid }: IAdUnitsComponentProps): JSX.Element => {
  const [allBidResponseEvents, setAllBidResponseEvents] = React.useState<IPrebidBidResponseEventData[]>([]);
  const [allNoBidEvents, setAllNoBidEvents] = React.useState<IPrebidNoBidEventData[]>([]);
  const [allBidderEvents, setAllBidderEvents] = React.useState<IPrebidDetails['events'][]>([]);
  const [allAdUnitCodes, setAllAdUnitCodes] = React.useState<string[]>([]);
  const [auctionEndEvents, setAuctionEndEvents] = React.useState<IPrebidAuctionEndEventData[]>([]);
  const [adUnits, setAdUnits] = React.useState<IPrebidAdUnit[]>([]);

  useEffect(() => {
    const auctionEndEvents = ((prebid.events || []) as IPrebidAuctionEndEventData[])
      .filter((event) => event.eventType === 'auctionInit' || event.eventType === 'auctionEnd' || event.eventType === 'noEventsApi')
      .sort((a, b) => a.args.timestamp - b.args.timestamp);
    const adUnits = auctionEndEvents
      .reduce((previousValue, currentValue) => {
        return [...previousValue, ...currentValue.args.adUnits];
      }, [] as IPrebidAdUnit[]) //TODO: 1 reducer only
      .reduce((previousValue, currentValue) => {
        let toUpdate = previousValue.find((adUnit) => adUnit.code === currentValue.code);
        if (toUpdate) {
          toUpdate = merge(toUpdate, currentValue);
          return previousValue;
        } else {
          return [...previousValue, currentValue];
        }
      }, [])
      .sort((a, b) => (a.code > b.code ? 1 : -1));
    const allBidResponseEvents = (prebid.events?.filter((event) => event.eventType === 'bidResponse') || []) as IPrebidBidResponseEventData[];
    const allNoBidEvents = (prebid.events?.filter((event) => event.eventType === 'noBid') || []) as IPrebidNoBidEventData[];
    setAllBidResponseEvents(allBidResponseEvents);
    setAllNoBidEvents(allNoBidEvents);
    setAdUnits(adUnits);
    const allAdUnitCodes = Array.from(
      new Set(
        prebid.events?.reduce((acc, event) => {
          if (event.eventType === 'auctionInit' || event.eventType === 'auctionEnd' || event.eventType === 'noEventsApi') {
            const adUnitCodes = (event as IPrebidAuctionInitEventData).args.adUnitCodes;
            acc = [...acc, ...adUnitCodes];
          }
          return acc;
        }, [] as string[])
      )
    );
    setAllAdUnitCodes(allAdUnitCodes);
  }, [prebid.events]);

  useEffect(() => {
    const allBidderEventsBidders = Array.from(new Set([].concat(allBidResponseEvents, allNoBidEvents).map((event) => event?.args.bidder)));
    setAuctionEndEvents(auctionEndEvents);
    setAllBidderEvents(allBidderEventsBidders);
  }, [allBidResponseEvents, allNoBidEvents, auctionEndEvents]);

  logger.log(`[PopUp][AdUnitsComponent]: render `, allBidResponseEvents, allNoBidEvents, allBidderEvents, allAdUnitCodes);
  return (
    <React.Fragment>
      {allAdUnitCodes[0] && (
        <React.Fragment>
          <Grid container direction="row" justifyContent="space-between" spacing={1} sx={{ p: 1 }}>
            <Grid item>
              <Paper sx={{ p: 1 }} elevation={1}>
                {prebid.version && <Typography variant="h2">Version: {prebid.version}</Typography>}
              </Paper>
            </Grid>
            <Grid item>
              <Paper sx={{ p: 1 }} elevation={1}>
                {prebid.config?.bidderTimeout && <Typography variant="h2">Timeout: {prebid.config.bidderTimeout}</Typography>}
              </Paper>
            </Grid>
            <Grid item>
              <Paper sx={{ p: 1 }} elevation={1}>
                <Typography variant="h2">AdUnits: {allAdUnitCodes.length}</Typography>
              </Paper>
            </Grid>
            <Grid item>
              <Paper sx={{ p: 1 }} elevation={1}>
                <Typography variant="h2">Bidders: {allBidderEvents.length}</Typography>
              </Paper>
            </Grid>
            <Grid item>
              <Paper sx={{ p: 1 }} elevation={1}>
                <Typography variant="h2">
                  Bid{allBidResponseEvents.length > 1 ? 's' : ''}: {allBidResponseEvents.length}
                </Typography>
              </Paper>
            </Grid>
            <Grid item>
              <Paper sx={{ p: 1 }} elevation={1}>
                <Typography variant="h2">
                  noBid{allNoBidEvents.length > 1 ? 's' : ''} : {allNoBidEvents.length}
                </Typography>
              </Paper>
            </Grid>
            <Grid item>
              <Paper sx={{ p: 1 }} elevation={1}>
                <Typography variant="h2">
                  Event{prebid.events?.length > 1 ? 's' : ''} : {prebid.events?.length}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12}>
              <Grid spacing={0.25} container direction="row">
                {prebid.events && prebid.events[0] && <SlotsComponent events={prebid.events} adUnits={adUnits} />}
              </Grid>
            </Grid>
          </Grid>
        </React.Fragment>
      )}
      {!allAdUnitCodes[0] && (
        <Grid container direction="row" justifyContent="space-evenly">
          <Grid item>
            <Paper elevation={1} sx={{ p: 1 }}>
              <Typography variant="h1">Prebid.js detected but no AdUnits</Typography>
            </Paper>
          </Grid>
        </Grid>
      )}
    </React.Fragment>
  );
};

interface IAdUnitsComponentProps {
  prebid: IPrebidDetails;
}

export default AdUnitsComponent;
