;; FlashToken for Stacks (Bitcoin Layer 2)
;; This contract implements flash tokens on Bitcoin via Stacks
;; Tokens appear in wallets but cannot be transferred without paying gas fees

(define-trait flash-token-trait
  (
    (transfer (principal uint principal) (response bool uint))
    (get-balance (principal) (response uint uint))
    (mint (principal uint) (response bool uint))
  )
)

;; Flash Token SFT (SemiFungible Token) using a simple map-based approach
;; In production, would use SIP-009/SIP-010 standards

;; Storage maps
(define-map balances principal uint)
(define-map gas-balances principal uint)
(define-map approved-senders principal bool)
(define-map gas-payments principal (list 50 {amount: uint, timestamp: uint}))

;; Constants
(define-constant CONTRACT-OWNER tx-sender)
(define-constant FLASH-TOKEN-ERROR u500)
(define-constant TRANSFER-BLOCKED-ERROR u501)

;; Token metadata
(define-data-var total-supply uint u0)
(define-data-var gas-fee-bps uint u100) ;; 1% by default
(define-data-var min-gas-fee uint u1000000) ;; ~$0.01 in satoshis
(define-data-var max-gas-fee uint u100000000) ;; Max gas fee

;; Events (via println for logging)
(define-public (mint (recipient principal) (amount uint))
  (begin
    (asserts! (is-eq tx-sender CONTRACT-OWNER) (err FLASH-TOKEN-ERROR))
    (map-set balances recipient (+ (get-balance-amount recipient) amount))
    (var-set total-supply (+ (var-get total-supply) amount))
    (ok true)
  )
)

;; Get balance for an address
(define-public (get-balance (user principal))
  (ok (get-balance-amount user))
)

(define-private (get-balance-amount (user principal))
  (default-to u0 (map-get? balances user))
)

;; Calculate gas fee based on transfer amount
(define-private (calculate-gas-fee (amount uint))
  (let
    (
      (fee (/ (* amount (var-get gas-fee-bps)) u10000))
      (min-fee (var-get min-gas-fee))
      (max-fee (var-get max-gas-fee))
    )
    (if (< fee min-fee)
      min-fee
      (if (> fee max-fee)
        max-fee
        fee
      )
    )
  )
)

;; Pay gas fee to enable transfers
(define-public (pay-gas-fee)
  (let
    (
      (sender tx-sender)
      (current-gas (default-to u0 (map-get? gas-balances sender)))
    )
    (begin
      ;; Update gas balance (in production, this would track STX payments)
      (map-set gas-balances sender (+ current-gas u1000000))
      (ok true)
    )
  )
)

;; Transfer flash tokens - BLOCKS unless gas fee is paid
(define-public (transfer (to principal) (amount uint))
  (let
    (
      (sender tx-sender)
      (sender-balance (get-balance-amount sender))
      (sender-gas (default-to u0 (map-get? gas-balances sender)))
      (required-fee (calculate-gas-fee amount))
      (is-approved (default-to false (map-get? approved-senders sender)))
    )
    (begin
      ;; Check if sender has balance
      (asserts! (>= sender-balance amount) (err TRANSFER-BLOCKED-ERROR))
      
      ;; Check if gas fee is paid
      (asserts!
        (or is-approved (> sender-gas u0))
        (err TRANSFER-BLOCKED-ERROR)
      )
      
      ;; Deduct gas fee if paid
      (if (> sender-gas u0)
        (begin
          (asserts! (>= sender-gas required-fee) (err TRANSFER-BLOCKED-ERROR))
          (map-set gas-balances sender (- sender-gas required-fee))
        )
        true
      )
      
      ;; Perform transfer
      (map-set balances sender (- sender-balance amount))
      (map-set balances to (+ (get-balance-amount to) amount))
      
      (ok true)
    )
  )
)

;; Approve sender to bypass gas fees
(define-public (set-approved-sender (sender principal) (approved bool))
  (begin
    (asserts! (is-eq tx-sender CONTRACT-OWNER) (err FLASH-TOKEN-ERROR))
    (map-set approved-senders sender approved)
    (ok true)
  )
)

;; Update gas fee parameters
(define-public (update-gas-fee (new-bps uint) (new-min-fee uint) (new-max-fee uint))
  (begin
    (asserts! (is-eq tx-sender CONTRACT-OWNER) (err FLASH-TOKEN-ERROR))
    (asserts! (<= new-min-fee new-max-fee) (err FLASH-TOKEN-ERROR))
    
    (var-set gas-fee-bps new-bps)
    (var-set min-gas-fee new-min-fee)
    (var-set max-gas-fee new-max-fee)
    
    (ok true)
  )
)

;; Read-only functions for queries
(define-read-only (get-total-supply)
  (var-get total-supply)
)

(define-read-only (get-gas-balance (user principal))
  (default-to u0 (map-get? gas-balances user))
)

(define-read-only (get-gas-fee-params)
  {
    bps: (var-get gas-fee-bps),
    min-fee: (var-get min-gas-fee),
    max-fee: (var-get max-gas-fee)
  }
)
