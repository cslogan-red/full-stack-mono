import {
  ListItem,
  ListItemText,
  Button,
  Switch,
  FormGroup,
  FormControlLabel,
  TextField,
} from '@mui/material';
import SentimentVerySatisfiedIcon from '@mui/icons-material/SentimentVerySatisfied';
import MoodBadIcon from '@mui/icons-material/MoodBad';
import { WORKER_STATUS } from '../../hooks/useWorker';
import { BATCH_SIZE, type WorkerSizeType } from '../../utils/general';
// styles
import './SideNav.scss';
import { useEffect, useState } from 'react';

type SideNavProps = {
  multiThreadedCheckedHandler: (e: React.ChangeEvent<HTMLInputElement>) => void;
  smallItemCountHandler: (size: number) => void;
  largeItemCountHandler: (size: number) => void;
  smallWorkerHandler: {
    status: string;
    kill: Function;
    clickHandler: (size: WorkerSizeType) => void;
  };
  largeWorkerHandler: {
    status: string;
    kill: Function;
    clickHandler: (size: WorkerSizeType) => void;
  };
  partyWorkerHandler: {
    status: string;
    kill: Function;
    clickHandler: () => void;
  };
  smallWorkerResults: number | undefined;
  largeWorkerResults: number | undefined;
};

const SideNav = ({
  multiThreadedCheckedHandler,
  smallItemCountHandler,
  largeItemCountHandler,
  smallWorkerHandler,
  largeWorkerHandler,
  partyWorkerHandler,
  smallWorkerResults,
  largeWorkerResults,
}: SideNavProps) => {
  const [multiThreadedChecked, setMultiThreadedChecked] = useState(true);
  const [smallItemCount, setSmallItemCount] = useState(BATCH_SIZE.small);
  const [largeItemCount, setLargeItemCount] = useState(BATCH_SIZE.large);
  const [smallWorkerStatus, setSmallWorkerStatus] = useState(smallWorkerHandler?.status ?? '');
  const [largeWorkerStatus, setLargeWorkerStatus] = useState(largeWorkerHandler?.status ?? '');
  const [partyWorkerStatus, setPartyWorkerStatus] = useState(partyWorkerHandler?.status ?? '');
  useEffect(() => {
    console.log('Small Worker Status:', smallWorkerHandler?.status);
    console.log('Large Worker Status:', largeWorkerHandler?.status);
    console.log('Party Worker Status:', partyWorkerHandler?.status);
    setSmallWorkerStatus(smallWorkerHandler?.status);
    setLargeWorkerStatus(largeWorkerHandler?.status);
    setPartyWorkerStatus(partyWorkerHandler?.status);
  }, [smallWorkerHandler?.status, largeWorkerHandler?.status, partyWorkerHandler?.status]);
  return (
    <div className={'sidenav'} aria-label={'sidenav-container'}>
      <div className={'sidenav--header'}>
        <span>Map Demo</span>
      </div>
      <div className={'sidenav--content'}>
        <div className={'sidenav--content-switch'}>
          <FormGroup className={'sidenav--content-switch-group'}>
            <FormControlLabel
              control={
                <Switch
                  defaultChecked
                  checked={multiThreadedChecked}
                  onChange={(e) => {
                    setMultiThreadedChecked(!multiThreadedChecked);
                    multiThreadedCheckedHandler(e);
                  }}
                  aria-label={'sidenav--content-switch'}
                />
              }
              label="Mutli-Threaded?"
            />
          </FormGroup>
        </div>
        <div className={'sidenav--content-controls'}>
          <div className={'sidenav--content-controls-input'}>
            <TextField
              placeholder={`Total items (default ${BATCH_SIZE.small})`}
              error={smallItemCount > BATCH_SIZE.smallMax}
              helperText={smallItemCount > BATCH_SIZE.smallMax ? `Max ${BATCH_SIZE.smallMax}` : ''}
              onChange={(e) => {
                const val = e.currentTarget?.value
                  ? parseInt(e.currentTarget.value)
                  : BATCH_SIZE.small;
                if (val > 0) {
                  smallItemCountHandler(val);
                  setSmallItemCount(parseInt(e.currentTarget.value));
                }
              }}
            />
          </div>
          <Button
            variant="contained"
            onClick={() => {
              if (smallWorkerStatus === WORKER_STATUS.RUNNING) {
                smallWorkerHandler.kill && smallWorkerHandler.kill();
              } else {
                smallWorkerHandler?.clickHandler && smallWorkerHandler.clickHandler('small');
              }
            }}
          >
            {smallWorkerStatus === WORKER_STATUS.RUNNING
              ? 'Kill Small Worker'
              : 'Start Small Worker'}
          </Button>
          <div className={'sidenav--content-controls-input'}>
            <TextField
              placeholder={`Total items (default ${BATCH_SIZE.large})`}
              error={largeItemCount > BATCH_SIZE.largeMax}
              helperText={largeItemCount > BATCH_SIZE.largeMax ? `Max ${BATCH_SIZE.largeMax}` : ''}
              onChange={(e) => {
                const val = e.currentTarget?.value
                  ? parseInt(e.currentTarget.value)
                  : BATCH_SIZE.large;
                if (val > 0) {
                  largeItemCountHandler(val);
                  setLargeItemCount(parseInt(e.currentTarget.value));
                }
              }}
            />
          </div>
          <Button
            variant="contained"
            onClick={() => {
              if (largeWorkerStatus === WORKER_STATUS.RUNNING) {
                largeWorkerHandler.kill && largeWorkerHandler.kill();
              } else {
                largeWorkerHandler?.clickHandler && largeWorkerHandler.clickHandler('large');
              }
            }}
          >
            {largeWorkerStatus === WORKER_STATUS.RUNNING
              ? 'Kill Large Worker'
              : 'Start Large Worker'}
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              if (partyWorkerStatus === WORKER_STATUS.RUNNING) {
                partyWorkerHandler.kill && partyWorkerHandler.kill();
              } else {
                partyWorkerHandler?.clickHandler && partyWorkerHandler.clickHandler();
              }
            }}
            endIcon={
              partyWorkerStatus === WORKER_STATUS.RUNNING ? (
                <MoodBadIcon />
              ) : (
                <SentimentVerySatisfiedIcon />
              )
            }
          >
            {partyWorkerStatus === WORKER_STATUS.RUNNING ? 'End the party...' : 'Party Mode!'}
          </Button>
          <ListItem>
            <ListItemText
              primary={
                <div className={'sidenav--content-results'}>
                  <div>
                    Small Batch Size:{' '}
                    {smallWorkerResults && smallWorkerResults > 0 ? `${smallWorkerResults}` : 'N/A'}
                  </div>
                  <div>
                    Large Batch Size:{' '}
                    {largeWorkerResults && largeWorkerResults > 0 ? `${largeWorkerResults}` : 'N/A'}
                  </div>
                </div>
              }
            />
          </ListItem>
        </div>
      </div>
    </div>
  );
};
export default SideNav;
