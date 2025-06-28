import {
  ListItem,
  ListItemText,
  Button,
  Switch,
  FormGroup,
  FormControlLabel,
} from '@mui/material';
import { WORKER_STATUS } from '../../hooks/useWorker';
import { type WorkerSizeType } from '../../utils/general';
// styles
import './SideNav.scss';
import { useEffect, useState } from 'react';

type SideNavProps = {
  multiThreadedCheckedHandler: (e: React.ChangeEvent<HTMLInputElement>) => void;
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
  smallWorkerResults: number | undefined;
  largeWorkerResults: number | undefined;
};

const SideNav = ({
  multiThreadedCheckedHandler,
  smallWorkerHandler,
  largeWorkerHandler,
  smallWorkerResults,
  largeWorkerResults,
}: SideNavProps) => {
  const [multiThreadedChecked, setMultiThreadedChecked] = useState(true);
  const [smallWorkerStatus, setSmallWorkerStatus] = useState(smallWorkerHandler.status);
  const [largeWorkerStatus, setLargeWorkerStatus] = useState(largeWorkerHandler.status);
  useEffect(() => {
    console.log('Small Worker Status:', smallWorkerHandler.status);
    console.log('Large Worker Status:', largeWorkerHandler.status);
    setSmallWorkerStatus(smallWorkerHandler.status);
    setLargeWorkerStatus(largeWorkerHandler.status);
  }, [smallWorkerHandler.status, largeWorkerHandler.status]);
  return (
    <div className={'sidenav'}>
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
                />
              }
              label="Mutli-Threaded?"
            />
          </FormGroup>
        </div>
        <div className={'sidenav--content-controls'}>
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
          <ListItem>
            <ListItemText
              primary={
                <div className={'sidenav--content-results'}>
                  <div>Small Worker Results: {smallWorkerResults && smallWorkerResults > 0 ? `${smallWorkerResults}` : 'N/A'}</div>
                  <div>Large Worker Results: {largeWorkerResults && largeWorkerResults > 0 ? `${largeWorkerResults}` : 'N/A'}</div>
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
