import React from "react";
import { Flex, Box } from "reflexbox";
import dayjs from "dayjs";

const Modal = ({ trades, currency, onClose }) => (
  <div className="modal is-active">
    <div className="modal-background" />
    <Box
      sx={{
        borderRadius: "4px!important"
      }}
      className="modal-card"
    >
      <Box bg="#14171c" className="modal-card-body">
        <Box as="h5" color="white" className="subtitle">
          Open Trades
        </Box>
        <Box className="trade-list">
          {!trades.length && (
            <Box as="span" color="rgba(255,255,255, .5)">
              No open trade
            </Box>
          )}
          {trades.map(trade => (
            <Flex
              key={`${trade.symbol}.${trade.openTime}.${trade.openPrice}`}
              flexDirection="row"
              alignItems="center"
              bg="rgba(255,255,255, .05)"
              sx={{
                borderRadius: 4,
                boxShadow:
                  "0 0 2px rgba(0,0,0, .15), inset 0 0px 1px rgba(255,255,255,.15)"
              }}
              mb={2}
            >
              <Box p={3} width={1 / 4}>
                <Box fontSize={2} fontWeight="bold" color="white" as="span">
                  {trade.symbol}
                </Box>
              </Box>
              <Box flex="auto" px={2}>
                <Box
                  py={1}
                  fontSize={1}
                  color="rgba(255,255,255, .5)"
                  as="span"
                  display="block"
                >
                  {trade.action} / {trade.sizing.value}
                </Box>
                <Box
                  py={1}
                  display="block"
                  fontSize={0}
                  color="rgba(255,255,255, .5)"
                  as="span"
                >
                  {dayjs(trade.openTime).format("D MMM YYYY")}
                </Box>
              </Box>
              <Box p={3} className="has-text-right" width={[2 / 5, 1 / 4]}>
                <Box
                  as="span"
                  fontWeight="bold"
                  fontSize={3}
                  className={`${
                    trade.profit > 0 ? "has-text-success" : "has-text-danger"
                  }`}
                  display="block"
                >
                  {trade.profit} {currency}
                </Box>
                <Box
                  as="span"
                  fontWeight="bold"
                  fontSize={1}
                  className={`${
                    trade.pips > 0 ? "has-text-success" : "has-text-danger"
                  }`}
                  display="block"
                >
                  {trade.pips} pips
                </Box>
              </Box>
            </Flex>
          ))}
        </Box>
      </Box>
    </Box>
    <button
      onClick={onClose}
      className="modal-close is-large"
      aria-label="close"
    />
  </div>
);

export default Modal;
